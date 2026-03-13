import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";

export const metadata: Metadata = {
  title: "Članovi",
  description: "Upoznajte članove udruženja Diaverzum Novi Sad.",
};

const members = [
  {
    name: "Stevan Stejić",
    role: "Predsednik udruženja",
    image: "/content/clanovi/Stevan Stejic.png",
    bio: "Upoznajte Stevana. Stevan trči maratone, predsednik je udruženja osoba obolelih od dijabetesa, i voli kobasicu — što je otprilike najkontradiktornije što možete čuti u jednoj rečenici. Dok ostali maratonci na kraju trke dobiju medalju i bananu, Stevan dobije medalju, ubod u prst i predavanje od doktora. Kao predsednik udruženja, Stevan drži inspirativne govore o zdravom životu, a odmah nakon toga nestaje iza ugla sa kobasicom u ruci. Njegovi članovi mu vjeruju. Ne bi trebali.",
  },
  {
    name: "Spasoje Malbaški",
    role: "Sekretar (kafe kuvarica)",
    image: "/content/clanovi/Spasoje Malbaski.png",
    bio: "Ovo je Spasoje. Spasoje ne može da pojede tortu na rođendanu, ali zato stoji pored stola i gleda drugima u tanjire kao uplašeni labrador. Njegovi prsti su toliko izbodeni iglicama da kad stisnete mu ruku, zvuči kao da ste zagazili u balončiće. Doktor mu je rekao da pazi na šećer — Spasoje je to shvatio tako ozbiljno da sada upada u tuđe razgovore i objašnjava zašto ni oni ne bi smeli da jedu kolač. Niko ga nije pitao. Nikad ga niko ništa ne pita.",
  },
  {
    name: "Aleksa Atanacković",
    role: "Mlađi referent (levo smetalo)",
    image: "/content/clanovi/Aleksa Atanackovic.png",
    bio: "Upoznajte Aleksu. Aleksa je bloger, propala viralna pojava na Instagramu, i dijabetičar — što znači da fotografiše hranu koju ne sme da jede i dobija lajkove od ljudi koji ne znaju da on plače iznutra. Torbica mu izgleda kao mali farmaceutski magacin — insulin, glukometar, rezervne igle, i negde na dnu, ring svetlo za reels u kojima objašnjava \"moj dijabetes journey\". Na svakoj proslavi on je onaj koji pita \"a ima li ovo šećera?\" — pa to snimi za story.",
  },
  {
    name: "Jovana Živić",
    role: "Nutricionista (diploma postoji, razum diskutabilan)",
    image: "/content/clanovi/Jovana Zivic.png",
    bio: "Upoznajte Jovanu Živić. Jovana je nutricionista, dijabetičar, i influenser — što je otprilike kao kad vatrogasac dođe na posao u benzinom natopljenom odelu. Vodi Instagram stranu NutriDijabetes, a ustvari se fotografiše po teretanama sa izrazom lica čoveka koji je pronašao smisao života, dok je glukometaru u torbici iskočio osigurač od visokog šećera. Svaki njen post počinje sa \"danas sam izabrala zdravlje\" — a završava se privatnom porukom doktoru u 11 uveče. Jovana zna sve o dijabetesu. Jovana zna tačno šta sme, a šta ne sme da jede. Jovana svejedno to ne poštuje, ali zato to radi sa savršenim osvetljenjem i filterom koji je u stanju da izgladi i glikemijsku krivu, pa čak i da insulinu da estetski izgled smoothija od spanaća. Njen životni moto je \"Neću umreti, a sve ostalo je rešivo\" — što je izjavila dok je u jednoj ruci držala merač šećera, a u drugoj parče čokolade koju je proglasila \"terapeutskom dozom\".",
  },
];

export default function ClanoviPage() {

  return (
    <div className="section-padding">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav aria-label="Putanja" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-brand-blue">Početna</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">Članovi</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-gray-900 mb-4">Naši članovi</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Upoznajte ljude koji čine Diaverzum Novi Sad — tim posvećen
            poboljšanju kvaliteta života sa dijabetesom.
          </p>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => (
            <article key={member.name} className="card overflow-hidden">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-blue-light">
                <Img
                  src={member.image}
                  alt={`Fotografija: ${member.name}`}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">
                  {member.role}
                </p>
                <h2 className="text-lg font-bold text-gray-900 mb-3">{member.name}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-16 bg-brand-blue-light rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Postani član</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Pridruži se zajednici Diaverzum Novi Sad i dobij pristup svim
            programima, edukacijama i grupama podrške.
          </p>
          <Link href="/kontakt" className="btn-primary">
            Kontaktiraj nas
          </Link>
        </div>
      </div>
    </div>
  );
}
