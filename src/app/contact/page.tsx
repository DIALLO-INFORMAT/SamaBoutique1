
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // Import Loader2
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

// Re-define schema outside component if needed elsewhere, or keep inline if only used here
const createFormSchema = (t: Function) => z.object({
  name: z.string().min(2, {
    message: t('contact_form_name') + " must contain at least 2 characters.", // Example: combine key and static text
  }),
  email: z.string().email({
    message: t('contact_form_email') + " must be a valid email address.",
  }),
  subject: z.string().min(5, {
    message: t('contact_form_subject') + " must contain at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: t('contact_form_message') + " must contain at least 10 characters.",
  }).max(500, {
    message: t('contact_form_message') + " cannot exceed 500 characters."
  }),
});


export default function ContactPage() {
  const { toast } = useToast();
  const { t } = useTranslation(); // Use the translation hook

  // Initialize schema inside the component to access `t`
  const formSchema = createFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate sending the message
    console.log("Form submitted:", values);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t('contact_toast_success_title'),
      description: t('contact_toast_success_description'),
      className: "bg-primary text-primary-foreground border-primary",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto max-w-4xl flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">{t('contact_page_title')}</CardTitle>
          <CardDescription>{t('contact_page_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   control={form.control}
                   name="name"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('contact_form_name')}</FormLabel>
                       <FormControl>
                         <Input placeholder={t('contact_form_name_placeholder')} {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="email"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('contact_form_email')}</FormLabel>
                       <FormControl>
                         <Input type="email" placeholder={t('contact_form_email_placeholder')} {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact_form_subject')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('contact_form_subject_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contact_form_message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('contact_form_message_placeholder')}
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription className="text-right">
                        {t('contact_form_char_count', { count: field.value?.length ?? 0 })}
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                 type="submit"
                 className="w-full"
                 disabled={form.formState.isSubmitting}
                 variant="destructive"
              >
                 {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {form.formState.isSubmitting ? t('contact_form_sending') : t('contact_form_send')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
