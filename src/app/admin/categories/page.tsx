// src/app/admin/categories/page.tsx (Admin View)
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Import Dialog components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIES_STORAGE_KEY = 'sama_boutique_categories'; // Use the same key for admin/manager for simplicity

// --- Mock API Functions (identical to manager for now) ---
const fetchCategoriesFromAPI = async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const categories = stored ? JSON.parse(stored) : [];
    // Simulate createdAt if missing and sort
    return categories.map((cat: any) => ({
        ...cat,
        createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
    })).sort((a: Category, b: Category) => a.name.localeCompare(b.name));
};

const addCategoryAPI = async (name: string, description?: string): Promise<Category> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        description,
        createdAt: new Date(),
    };
    if (typeof window !== 'undefined') {
        const categories = await fetchCategoriesFromAPI();
        if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`La catégorie "${name}" existe déjà.`);
        }
        categories.push(newCategory);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
    return newCategory;
};

const updateCategoryAPI = async (id: string, name: string, description?: string): Promise<Category> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let updatedCategory: Category | null = null;
    if (typeof window !== 'undefined') {
        let categories = await fetchCategoriesFromAPI();
        const index = categories.findIndex(cat => cat.id === id);
        if (index === -1) throw new Error("Catégorie non trouvée.");
        if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`Une autre catégorie nommée "${name}" existe déjà.`);
        }
        categories[index] = { ...categories[index], name, description: description || categories[index].description };
        updatedCategory = categories[index];
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
    if (!updatedCategory) throw new Error("Erreur lors de la mise à jour.");
    return updatedCategory;
};

const deleteCategoryAPI = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (typeof window !== 'undefined') {
        let categories = await fetchCategoriesFromAPI();
        // TODO: Check if category is in use by products before deleting
        categories = categories.filter(cat => cat.id !== id);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
};

export default function AdminCategoriesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [dialogError, setDialogError] = useState('');
    const { toast } = useToast();

    // Authorization Check
    useEffect(() => {
        if (!authLoading && user?.role !== 'admin') {
            toast({ title: "Accès non autorisé", description: "Seuls les administrateurs peuvent accéder.", variant: "destructive" });
            router.replace('/'); // Redirect to home or login
        } else if (user?.role === 'admin') {
            loadCategories();
        } else if (!authLoading) {
             setIsLoading(false); // Stop loading if auth loaded but not admin
        }
    }, [user, authLoading, toast, router, t]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const fetchedCategories = await fetchCategoriesFromAPI();
            setCategories(fetchedCategories);
        } catch (error) {
            toast({ title: t('general_error'), description: "Impossible de charger les catégories.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Dialog and CRUD operations (identical to manager page for now)
    const openAddDialog = () => {
        setEditingCategory(null); setCategoryName(''); setCategoryDescription(''); setDialogError(''); setIsDialogOpen(true);
    };
    const openEditDialog = (category: Category) => {
        setEditingCategory(category); setCategoryName(category.name); setCategoryDescription(category.description || ''); setDialogError(''); setIsDialogOpen(true);
    };

    const handleDialogSave = async () => {
        if (!categoryName.trim()) { setDialogError("Le nom de la catégorie est requis."); return; }
        setDialogError(''); setIsProcessing(editingCategory ? editingCategory.id : 'new');
        try {
            if (editingCategory) {
                const updated = await updateCategoryAPI(editingCategory.id, categoryName, categoryDescription);
                setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
                toast({ title: "Catégorie Modifiée", description: `"${updated.name}" mise à jour.` });
            } else {
                const added = await addCategoryAPI(categoryName, categoryDescription);
                setCategories(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
                toast({ title: "Catégorie Ajoutée", description: `"${added.name}" créée.` });
            }
            setIsDialogOpen(false);
        } catch (error: any) { setDialogError(error.message || "Une erreur est survenue."); }
        finally { setIsProcessing(null); }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        setIsProcessing(id);
        try {
            await deleteCategoryAPI(id);
            setCategories(prev => prev.filter(cat => cat.id !== id));
            toast({ title: "Catégorie Supprimée", description: `"${name}" supprimée.` });
        } catch (error) { toast({ title: t('general_error'), description: "Impossible de supprimer la catégorie.", variant: "destructive" }); }
        finally { setIsProcessing(null); }
    };

    // Loading/Unauthorized UI
    if (isLoading || authLoading) {
        return (
             <div className="space-y-8">
                 <Skeleton className="h-9 w-1/3" />
                 <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
             </div>
        );
    }
    if (user?.role !== 'admin') return null; // Render nothing if not admin (redirect handled in useEffect)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FolderTree /> {t('admin_categories_page_title')}</h1>
                    <p className="text-muted-foreground">{t('admin_categories_description')}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('admin_categories_add_button')}
                </Button>
            </div>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4"><CardTitle>{t('admin_categories_table_title')}</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {categories.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">{t('admin_categories_no_categories')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">{t('admin_categories_table_name')}</TableHead>
                                    <TableHead className="px-6 hidden sm:table-cell">{t('admin_categories_table_description')}</TableHead>
                                    <TableHead className="text-right px-6 w-[100px]">{t('admin_categories_table_actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium px-6 py-3">{category.name}</TableCell>
                                        <TableCell className="px-6 py-3 hidden sm:table-cell text-sm text-muted-foreground truncate max-w-xs">{category.description}</TableCell>
                                        <TableCell className="text-right px-6 py-3">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" disabled={isProcessing === category.id}>{isProcessing === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}<span className="sr-only">Actions</span></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{t('admin_categories_table_actions')}</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditDialog(category)} className="cursor-pointer"><Edit className="mr-2 h-4 w-4" /> {t('admin_products_action_edit')}</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" data-alert-type="delete" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> {t('admin_products_action_delete')}</Button>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                 <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('admin_categories_delete_confirm_title')}</AlertDialogTitle>
                                                        <AlertDialogDescription>{t('admin_categories_delete_confirm_description', { categoryName: category.name })}</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteCategory(category.id, category.name)} className={buttonVariants({ variant: "destructive" })} disabled={isProcessing === category.id}>{isProcessing === category.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('general_delete')}</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog (identical structure to manager) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? t('admin_categories_edit_dialog_title') : t('admin_categories_add_dialog_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="cat-name">{t('admin_categories_table_name')}</Label><Input id="cat-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nom de la catégorie"/></div>
                        <div className="space-y-2"><Label htmlFor="cat-desc">{t('admin_categories_table_description')} ({t('checkout_form_optional')})</Label><Textarea id="cat-desc" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="Courte description..." rows={3}/></div>
                        {dialogError && <p className="text-sm text-destructive">{dialogError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('general_cancel')}</Button>
                        <Button onClick={handleDialogSave} disabled={!categoryName.trim() || !!isProcessing} variant="destructive">{isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('general_save')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
