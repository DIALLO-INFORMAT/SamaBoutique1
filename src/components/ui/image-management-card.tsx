// src/components/ui/image-management-card.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export interface ImageItem {
  id?: string; // Optional ID for partner logos
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
    const [error, setError] = useState('');

    const handleAddImage = () => {
        setError('');
        if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
            setError(t('admin_settings_form_image_url_invalid'));
            return;
        }
        if (!newImageAlt) {
             setError(t('admin_settings_form_alt_text_required'));
             return;
        }
        if (!newImageHint) {
            setError(t('admin_settings_form_ai_hint_required'));
             return;
        }

        const newItem: T = {
            src: newImageUrl,
            alt: newImageAlt,
            hint: newImageHint,
            ...(itemType === 'partner' && { id: `logo-${Date.now()}` }),
        } as T;

        onImagesChange([...images, newItem]);
        setNewImageUrl('');
        setNewImageAlt('');
        setNewImageHint('');
    };

    const handleRemoveImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <Card className="shadow-md border-border">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* List Current Images */}
                {images.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border rounded-md p-3">
                        {images.map((img, index) => (
                            <div key={img.id || index} className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        width={itemType === 'carousel' ? 80 : 60}
                                        height={itemType === 'carousel' ? 40 : 30}
                                        className="rounded border object-contain bg-muted"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                    <div className="text-xs flex-grow min-w-0">
                                        <p className="font-medium truncate" title={img.alt}>{img.alt}</p>
                                        <p className="text-muted-foreground truncate" title={img.src}>{img.src}</p>
                                        <p className="text-muted-foreground truncate" title={img.hint}>Hint: {img.hint}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveImage(index)} className="text-destructive h-7 w-7">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('admin_settings_no_images')}</p>
                )}

                <Separator />

                {/* Add New Image Form */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('admin_settings_add_new_image')}</Label>
                     <Input
                         type="url"
                         placeholder={t('admin_settings_form_image_url')}
                         value={newImageUrl}
                         onChange={(e) => setNewImageUrl(e.target.value)}
                     />
                     <Input
                         type="text"
                         placeholder={t('admin_settings_form_alt_text')}
                         value={newImageAlt}
                         onChange={(e) => setNewImageAlt(e.target.value)}
                         maxLength={50}
                     />
                      <Input
                         type="text"
                         placeholder={t('admin_settings_form_ai_hint')}
                         value={newImageHint}
                         onChange={(e) => setNewImageHint(e.target.value)}
                         maxLength={30}
                         />
                     {error && <p className="text-xs text-destructive">{error}</p>}
                     <Button size="sm" variant="outline" onClick={handleAddImage} disabled={!newImageUrl || !newImageAlt || !newImageHint} className="w-full sm:w-auto">
                         <PlusCircle className="mr-2 h-4 w-4" /> {t('admin_settings_add_image_button')}
                     </Button>
                     <p className="text-xs text-muted-foreground">
                        {itemType === 'carousel' ? t('admin_settings_carousel_hint_desc') : t('admin_settings_partner_hint_desc')}
                     </p>
                </div>
            </CardContent>
        </Card>
    );
}
