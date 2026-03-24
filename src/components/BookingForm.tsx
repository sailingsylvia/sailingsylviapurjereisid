import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Anchor, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { voyageSections } from "@/data/voyageData";
import { toast } from "@/hooks/use-toast";

const BookingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    stage: "",
    participants: "",
    message: "",
  });

  // Combine all stages for dropdown
  const allStages = voyageSections.flatMap((section) =>
    section.stages
      .map((stage) => ({
        id: stage.id,
        label: `${stage.city} (${stage.duration})`,
      }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.stage) {
      toast({
        title: "Palun täitke kohustuslikud väljad",
        description: "Nimi, e-post, telefon ja etapi valik on kohustuslikud.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Vigane e-posti aadress",
        description: "Palun sisestage kehtiv e-posti aadress.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Päring saadetud!",
      description: "Võtame Teiega peagi ühendust.",
    });
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-ocean-deep" id="broneeri">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle size={64} className="mx-auto text-gold mb-6" />
            <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">
              Täname huvi eest!
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Oleme Teie päringu kätte saanud ja võtame peagi ühendust, et arutada purjereisi üksikasju.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  stage: "",
                  participants: "",
                  message: "",
                });
              }}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Saada uus päring
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-ocean-deep" id="broneeri">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-ocean-light font-medium text-sm uppercase tracking-widest mb-4">
            <Anchor size={16} />
            Broneerimine
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4">
            Tule purjetama!
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            Vali sobiv etapp ja küsi lisainfot. Vastame 24 tunni jooksul.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-card rounded-2xl p-8 shadow-elevated"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nimi *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Teie nimi"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-background"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-post *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="teie@email.ee"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-background"
                maxLength={255}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Telefon *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+372 5XXX XXXX"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-background"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants" className="text-foreground">
                Osalejate arv
              </Label>
              <Input
                id="participants"
                type="number"
                placeholder="1-6"
                min={1}
                max={6}
                value={formData.participants}
                onChange={(e) =>
                  setFormData({ ...formData, participants: e.target.value })
                }
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="stage" className="text-foreground">
              Vali etapp *
            </Label>
            <Select
              value={formData.stage}
              onValueChange={(value) =>
                setFormData({ ...formData, stage: value })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Vali soovitud etapp..." />
              </SelectTrigger>
              <SelectContent className="bg-card z-50 max-h-[300px]">
                {allStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mb-8">
            <Label htmlFor="message" className="text-foreground">
              Lisainfo / küsimused
            </Label>
            <Textarea
              id="message"
              placeholder="Kirjutage siia oma küsimused, erisoovid või muu oluline info..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="bg-background min-h-[120px]"
              maxLength={1000}
            />
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Saadan..."
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Saada päring
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            * Kohustuslikud väljad. Teie andmeid kasutatakse ainult päringu
            töötlemiseks.
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default BookingForm;
