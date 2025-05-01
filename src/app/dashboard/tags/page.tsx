// src/app/dashboard/tags/page.tsx (Manager View)
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Tags as TagsIcon } from "lucide-react";
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
import type { Tag } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Import Dialog components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const TAGS_STORAGE_KEY = 'sama_boutique_tags';

// --- Mock API Functions ---
const fetchTagsFromAPI = async (): Promise<Tag[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    const tags = stored ? JSON.parse(stored) : [];
    // Simulate createdAt if missing
    return tags.map((tag: any) => ({
        ...tag,
        createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),
    })).sort((a: Tag, b: Tag) => a.name.localeCompare(b.name)); // Sort alphabetically
};

const addTagAPI = async (name: string): Promise<Tag> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTag: Tag = {
        id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        createdAt: new Date(),
    };
    if (typeof window !== 'undefined') {
        const tags = await fetchTagsFromAPI();
        // Check for duplicate names (case-insensitive)
        if (tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`L'étiquette "${name}" existe déjà.`);
        }
        tags.push(newTag);
        localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    }
    return newTag;
};

const updateTagAPI = async (id: string, name: string): Promise<Tag> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let updatedTag: Tag | null = null;
    if (typeof window !== 'undefined') {
        let tags = await fetchTagsFromAPI();
        const index = tags.findIndex(tag => tag.id === id);
        if (index === -1) throw new Error("Étiquette non trouvée.");

        // Check for duplicate names (excluding the current tag being updated)
        if (tags.some(tag => tag.id !== id && tag.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`Une autre étiquette nommée "${name}" existe déjà.`);
        }

        tags[index] = { ...tags[index], name };
        updatedTag = tags[index];
        localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    }
    if (!updatedTag) throw new Error("Erreur lors de la mise à jour.");
    return updatedTag;
};

const deleteTagAPI = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (typeof window !== 'undefined') {
        let tags = await fetchTagsFromAPI();
        // TODO: Check if tag is in use by products before deleting
        tags = tags.filter(tag => tag.id !== id);
        localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    }
};

export default function ManagerTagsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null); // Tracks delete/edit ID
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [tagName, setTagName] = useState('');
    const [dialogError, setDialogError] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && user?.role !== 'manager') {
            toast({ title: t('dashboard_manager_unauthorized_access_toast_title'), description: "Accès refusé.", variant: "destructive" });
            router.replace('/dashboard');
        } else if (user?.role === 'manager') {
            loadTags();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, toast, router, t]);

    const loadTags = async () => {
        setIsLoading(true);
        try {
            const fetchedTags = await fetchTagsFromAPI();
            setTags(fetchedTags);
        } catch (error) {
            toast({ title: t('general_error'), description: "Impossible de charger les étiquettes.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingTag(null);
        setTagName('');
        setDialogError('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (tag: Tag) => {
        setEditingTag(tag);
        setTagName(tag.name);
        setDialogError('');
        setIsDialogOpen(true);
    };

    const handleDialogSave = async () => {
        if (!tagName.trim()) {
            setDialogError("Le nom de l'étiquette est requis.");
            return;
        }
        setDialogError('');
        setIsProcessing(editingTag ? editingTag.id : 'new');

        try {
            if (editingTag) {
                const updated = await updateTagAPI(editingTag.id, tagName);
                setTags(prev => prev.map(tag => tag.id === updated.id ? updated : tag));
                toast({ title: "Étiquette Modifiée", description: `"${updated.name}" mise à jour.` });
            } else {
                const added = await addTagAPI(tagName);
                setTags(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
                toast({ title: "Étiquette Ajoutée", description: `"${added.name}" créée.` });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
             setDialogError(error.message || "Une erreur est survenue.");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDeleteTag = async (id: string, name: string) => {
        setIsProcessing(id);
        try {
            await deleteTagAPI(id);
            setTags(prev => prev.filter(tag => tag.id !== id));
            toast({ title: "Étiquette Supprimée", description: `"${name}" supprimée.` });
        } catch (error) {
            toast({ title: t('general_error'), description: "Impossible de supprimer l'étiquette.", variant: "destructive" });
        } finally {
            setIsProcessing(null);
        }
    };

    if (isLoading || authLoading) {
        return (
             <div className="space-y-8">
                 <Skeleton className="h-9 w-1/3" />
                 <Card>
                     <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                     <CardContent className="space-y-4">
                         {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                     </CardContent>
                 </Card>
             </div>
        );
    }

    if (user?.role !== 'manager') return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><TagsIcon /> {t('manager_tags_page_title')}</h1>
                    <p className="text-muted-foreground">{t('manager_tags_description')}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('manager_tags_add_button')}
                </Button>
            </div>

            <Card className="shadow-md border-border">
                <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle>{t('manager_tags_table_title')}</CardTitle>
                    {/* Optional: Search/Filter */}
                </CardHeader>
                <CardContent className="p-0">
                    {tags.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">{t('manager_tags_no_tags')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">{t('manager_tags_table_name')}</TableHead>
                                    <TableHead className="text-right px-6 w-[100px]">{t('manager_tags_table_actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tags.map((tag) => (
                                    <TableRow key={tag.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium px-6 py-3">{tag.name}</TableCell>
                                        <TableCell className="text-right px-6 py-3">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" disabled={isProcessing === tag.id}>
                                                            {isProcessing === tag.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{t('manager_tags_table_actions')}</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditDialog(tag)} className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" /> {t('admin_products_action_edit')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" data-alert-type="delete" className="text-destructive focus:text-destructive hover:bg-destructive/10 w-full justify-start px-2 py-1.5 h-auto text-sm font-normal cursor-pointer">
                                                                <Trash2 className="mr-2 h-4 w-4" /> {t('admin_products_action_delete')}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                 <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('manager_tags_delete_confirm_title')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('manager_tags_delete_confirm_description', { tagName: tag.name })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                                                            className={buttonVariants({ variant: "destructive" })}
                                                            disabled={isProcessing === tag.id}
                                                        >
                                                            {isProcessing === tag.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            {t('general_delete')}
                                                        </AlertDialogAction>
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
                 {/* Optional: Pagination */}
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingTag ? t('manager_tags_edit_dialog_title') : t('manager_tags_add_dialog_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tag-name">{t('manager_tags_table_name')}</Label>
                            <Input
                                id="tag-name"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                placeholder="Nom de l'étiquette"
                            />
                        </div>
                        {dialogError && <p className="text-sm text-destructive">{dialogError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('general_cancel')}</Button>
                        <Button onClick={handleDialogSave} disabled={!tagName.trim() || !!isProcessing} variant="destructive">
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('general_save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
