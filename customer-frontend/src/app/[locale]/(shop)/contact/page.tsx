"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const t = useTranslations("contact");
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: t("form.success"),
        description: "We'll get back to you soon!",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: t("form.error"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-[1280px] mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-4">
          {t("subtitle")}
        </p>
        <p className="text-base text-gray-500 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("contactInfo.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">{t("contactInfo.email.title")}</h3>
                  <p className="text-gray-600">{t("contactInfo.email.value")}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">{t("contactInfo.phone.title")}</h3>
                  <p className="text-gray-600">{t("contactInfo.phone.value")}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">{t("contactInfo.address.title")}</h3>
                  <p className="text-gray-600">{t("contactInfo.address.value")}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">{t("contactInfo.hours.title")}</h3>
                  <p className="text-gray-600">{t("contactInfo.hours.value")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("form.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">{t("form.subject")}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="message">{t("form.message")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? t("form.sending") : t("form.send")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">{t("socialMedia.title")}</h2>
        <div className="flex justify-center space-x-4">
          <Link href="https://www.facebook.com/">
            <Button size="lg" variant="outline">
              <Facebook className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="https://www.instagram.com/">
            <Button size="lg" variant="outline">
              <Instagram className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="https://www.twitter.com/">
            <Button size="lg" variant="outline">
              <Twitter className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
