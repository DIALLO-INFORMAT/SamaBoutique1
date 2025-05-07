// src/components/ui/image-management-card.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Edit, Check, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
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

// ImageItem interface might need explicit ID for partners
export interface ImageItem {
  id?: string; // Optional ID, primarily for partner logos
  src: string;
  alt: string;
  hint: string;
}

interface ImageManagementCardProps<T extends ImageItem> {
  title: string;
  description: string;
  images: T[];
  onImagesChange: (images: T[]) => void;
  itemType: 'carousel' | 'partner';
}

export function ImageManagementCard<T extends ImageItem>({
  title,
  description,
  images,
  onImagesChange,
  itemType,
}: ImageManagementCardProps<T>) {
    const { t } = useTranslation();
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageAlt, setNewImageAlt] = useState('');
    const [newImageHint, setNewImageHint] = useState('');
    const [addError, setAddError] = useState('');

    // State for editing
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editImageUrl, setEditImageUrl] = useState('');
    const [editImageAlt, setEditImageAlt] = useState('');
    const [editImageHint, setEditImageHint] = useState('');
    const [editError, setEditError] = useState('');

    const validateImageInput = (url: string, alt: string, hint: string): string | null => {
        if (!url.trim() || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            return t('admin_settings_form_image_url_invalid');
        }
        if (!alt.trim()) {
            return t('admin_settings_form_alt_text_required');
        }
        if (!hint.trim()) {
            return t('admin_settings_form_ai_hint_required');
        }
        if (hint.trim().split(' ').length > 2) {
            return "L'indice IA ne doit pas dépasser 2 mots.";
        }
        return null; // No error
    };

    const handleAddImage = () => {
        const error = validateImageInput(newImageUrl, newImageAlt, newImageHint);
        setAddError(error || '');
        if (error) return;

        const newItem: T = {
            src: newImageUrl.trim(),
            alt: newImageAlt.trim(),
            hint: newImageHint.trim(),
            ...(itemType === 'partner' && { id: `logo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` }),
        } as T;

        onImagesChange([...images, newItem]);
        setNewImageUrl('');
        setNewImageAlt('');
        setNewImageHint('');
    };

    const handleRemoveImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
        if (editingIndex === index) { 
             setEditingIndex(null);
        }
    };

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditImageUrl(images[index].src);
        setEditImageAlt(images[index].alt);
        setEditImageHint(images[index].hint);
        setEditError('');
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditError('');
    };

    const handleSaveEdit = (index: number) => {
         const error = validateImageInput(editImageUrl, editImageAlt, editImageHint);
         setEditError(error || '');
         if (error) return;

         const updatedImages = images.map((img, i) => {
            if (i === index) {
                return {
                    ...img, 
                    src: editImageUrl.trim(),
                    alt: editImageAlt.trim(),
                    hint: editImageHint.trim(),
                };
            }
            return img;
        });
        onImagesChange(updatedImages);
        setEditingIndex(null);
    };

    return (
        <Card className="shadow-md border-border">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {images.length > 0 ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 border rounded-md p-3">
                        {images.map((img, index) => (
                            <div key={img.id || index} className="flex items-start justify-between gap-2 border-b pb-3 last:border-b-0 last:pb-0">
                                {editingIndex === index ? (
                                    <div className="flex-grow space-y-2 pr-2">
                                        <Input
                                             type="url"
                                             placeholder={t('admin_settings_form_image_url')}
                                             value={editImageUrl}
                                             onChange={(e) => setEditImageUrl(e.target.value)}
                                             className="h-8 text-xs"
                                         />
                                        <Input
                                             type="text"
                                             placeholder={t('admin_settings_form_alt_text')}
                                             value={editImageAlt}
                                             onChange={(e) => setEditImageAlt(e.target.value)}
                                             maxLength={50}
                                             className="h-8 text-xs"
                                         />
                                        <Input
                                             type="text"
                                             placeholder={t('admin_settings_form_ai_hint') + " (max 2 mots)"}
                                             value={editImageHint}
                                             onChange={(e) => setEditImageHint(e.target.value)}
                                             maxLength={30}
                                             className="h-8 text-xs"
                                         />
                                         {editError && <p className="text-xs text-destructive">{editError}</p>}
                                         <div className="flex gap-1 pt-1">
                                              <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(index)} className="h-7 w-7 text-primary hover:text-primary">
                                                  <Check className="h-4 w-4" />
                                              </Button>
                                              <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                  <X className="h-4 w-4" />
                                              </Button>
                                         </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 flex-grow min-w-0">
                                            <Image
                                                src={img.src}
                                                alt={img.alt}
                                                width={itemType === 'carousel' ? 80 : 60}
                                                height={itemType === 'carousel' ? 45 : 30} // Adjusted height for carousel for better aspect ratio
                                                className="rounded border object-contain bg-muted flex-shrink-0"
                                                onError={(e) => {
                                                     // Attempt to load picsum fallback
                                                     const fallbackSrc = `https://picsum.photos/seed/${img.id || index}/${itemType === 'carousel' ? 80 : 60}/${itemType === 'carousel' ? 45 : 30}`;
                                                     if (e.currentTarget.src !== fallbackSrc) {
                                                         e.currentTarget.src = fallbackSrc;
                                                     } else {
                                                         // If picsum also fails, hide or show placeholder text
                                                         e.currentTarget.style.display = 'none';
                                                         // Or replace with a placeholder div:
                                                         // const placeholder = document.createElement('div');
                                                         // placeholder.className = "w-full h-full bg-muted text-xs flex items-center justify-center text-muted-foreground";
                                                         // placeholder.textContent = "Image error";
                                                         // e.currentTarget.parentNode?.replaceChild(placeholder, e.currentTarget);
                                                     }
                                                 }}
                                            />
                                            <div className="text-xs flex-grow min-w-0">
                                                <p className="font-medium truncate" title={img.alt}>{img.alt}</p>
                                                <p className="text-muted-foreground truncate" title={img.src}>{img.src}</p>
                                                <p className="text-muted-foreground truncate" title={img.hint}>Hint: {img.hint}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0 space-y-0.5">
                                             <Button variant="ghost" size="icon" onClick={() => startEditing(index)} className="h-7 w-7 text-muted-foreground hover:text-primary">
                                                 <Edit className="h-3.5 w-3.5" />
                                             </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                 <AlertDialogContent>
                                                     <AlertDialogHeader>
                                                         <AlertDialogTitle>{t('admin_settings_delete_image_title')}</AlertDialogTitle>
                                                         <AlertDialogDescription>
                                                             {t('admin_settings_delete_image_confirm', { altText: img.alt })}
                                                         </AlertDialogDescription>
                                                     </AlertDialogHeader>
                                                     <AlertDialogFooter>
                                                         <AlertDialogCancel>{t('general_cancel')}</AlertDialogCancel>
                                                         <AlertDialogAction
                                                             onClick={() => handleRemoveImage(index)}
                                                             className={buttonVariants({ variant: "destructive" })}
                                                         >
                                                             {t('general_delete')}
                                                         </AlertDialogAction>
                                                     </AlertDialogFooter>
                                                 </AlertDialogContent>
                                             </AlertDialog>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('admin_settings_no_images')}</p>
                )}

                <Separator />

                <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium">{t('admin_settings_add_new_image')}</Label>
                     <Input
                         type="url"
                         placeholder={t('admin_settings_form_image_url')}
                         value={newImageUrl}
                         onChange={(e) => setNewImageUrl(e.target.value)}
                         className="h-9 text-sm"
                     />
                     <Input
                         type="text"
                         placeholder={t('admin_settings_form_alt_text')}
                         value={newImageAlt}
                         onChange={(e) => setNewImageAlt(e.target.value)}
                         maxLength={50}
                         className="h-9 text-sm"
                     />
                      <Input
                         type="text"
                         placeholder={t('admin_settings_form_ai_hint') + " (max 2 mots)"}
                         value={newImageHint}
                         onChange={(e) => setNewImageHint(e.target.value)}
                         maxLength={30}
                         className="h-9 text-sm"
                         />
                     {addError && <p className="text-xs text-destructive">{addError}</p>}
                     <Button size="sm" variant="outline" onClick={handleAddImage} disabled={!newImageUrl || !newImageAlt || !newImageHint} className="w-full sm:w-auto">
                         <PlusCircle className="mr-2 h-4 w-4" /> {t('admin_settings_add_image_button')}
                     </Button>
                     <p className="text-xs text-muted-foreground">
                        {itemType === 'carousel' ? t('admin_settings_carousel_hint_desc') : t('admin_settings_partner_hint_desc')}
                         {" " + t('admin_settings_direct_url_only_hint')}
                     </p>
                </div>
            </CardContent>
        </Card>
    );
}
