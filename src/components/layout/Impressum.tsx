
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Impressum: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-xs text-muted-foreground hover:text-primary">
          Impressum
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4 text-left">
            <h2 className="font-bold text-xl">Impressum</h2>
            
            <div>
              <h3 className="font-semibold text-lg">Angaben gemäß § 5 TMG</h3>
              <p className="whitespace-pre-line mt-2">
                Sebastian Liedtke
                Immenweg 7A
                15366 Neuenhagen
                Deutschland
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Kontakt:</h3>
              <p className="mt-2">E-Mail: coachbastilive@gmail.com</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h3>
              <p className="whitespace-pre-line mt-2">
                Sebastian Liedtke
                (Immenweg 7A, 15366 Neuenhagen)
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Haftungsausschluss:</h3>
              <p className="mt-2">
                Die Inhalte dieser Webseite wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehme ich jedoch keine Gewähr. Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Urheberrecht:</h3>
              <p className="mt-2">
                Die durch mich erstellten Inhalte und Werke auf dieser Webseite unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen meiner schriftlichen Zustimmung.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Hinweis zur Online-Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO:</h3>
              <p className="mt-2">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die du unter <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://ec.europa.eu/consumers/odr</a> findest.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Impressum;
