
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  // Basic handler, in a real app this would submit the form data
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Thank you for your message! We will get back to you soon. (This is a placeholder response)");
    // Here you would typically send the form data to a backend or email service.
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Mail className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Get In Touch</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            We&apos;d love to hear from you! Whether you have a question about our services, need assistance, or just want to chat, please reach out.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Contact Information</h3>
            <div className="space-y-4 text-foreground">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-accent" />
                <span>info@homelandcapital.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-accent" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-accent mt-1" />
                <span>123 Real Estate Ave,<br />Property City, PC 54321</span>
              </div>
            </div>
            <div className="mt-6 border-t pt-6">
                 <h3 className="text-xl font-semibold text-primary mb-2">Office Hours</h3>
                 <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                 <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                 <p className="text-muted-foreground">Sunday: Closed</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
              </div>
               <div>
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input id="subject" name="subject" placeholder="Inquiry about..." required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea id="message" name="message" placeholder="Your message..." rows={5} required className="mt-1" />
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" /> Send Message
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
