import type { Metadata } from "next";
import Background from "@/components/Background";

export const metadata: Metadata = {
  title: "CGV – Creahub Solutions",
  description: "Conditions Générales de Vente de Creahub Solutions.",
};

const sections = [
  {
    title: "1. Identification",
    content: `Les présentes Conditions Générales de Vente (CGV) sont conclues entre :

Creahub Solutions – EI Corinne LIOT
SIREN : 908 329 832 | SIRET : 908 329 832 00012
N° TVA intracommunautaire : FR0E908329832
4 Rue du Chanoine Bonhoure, 31600 Muret, France
ci-après désigné « le Prestataire »

et toute personne physique ou morale souhaitant bénéficier de ses services,
ci-après désignée « le Client ».`,
  },
  {
    title: "2. Objet",
    content: `Les présentes CGV s'appliquent à l'ensemble des prestations fournies par Creahub Solutions dans le cadre de ses activités de développement web et applicatif, d'audit, de migration et de conseil technique. Elles définissent les droits et obligations de chacune des parties.

Toute commande implique l'acceptation sans réserve des présentes CGV.`,
  },
  {
    title: "3. Devis & commande",
    content: `Toute prestation fait l'objet d'un devis préalable, valable 30 jours à compter de sa date d'émission. La signature du devis par le Client vaut acceptation des présentes CGV et bon de commande ferme.

Aucune prestation ne sera démarrée avant :
- la signature du devis,
- le versement de l'acompte défini au devis (généralement 40 % du montant total).

Toute demande non prévue au devis fera l'objet d'un avenant tarifaire soumis à validation écrite du Client avant exécution.`,
  },
  {
    title: "4. Prix",
    content: `Les prix des prestations sont indiqués dans le devis signé par le Client. Ils sont exprimés en euros.

Conformément à l'article 293B du CGI, Creahub Solutions n'étant pas redevable de la TVA, les prix s'entendent TVA non applicable.

Le taux journalier est de 590 € HT. Pour les prestations au forfait, le montant global est précisé dans le devis.`,
  },
  {
    title: "5. Paiement",
    content: `Le paiement s'effectue par virement bancaire selon les conditions précisées dans le devis.

Pour les missions en régie, la facturation est mensuelle, sur la base du temps effectivement réalisé.

Les factures sont payables à réception, dans un délai maximum de 30 jours (art. L441-10 du Code de commerce).

En cas de retard de paiement :
- des pénalités de retard au taux de 10 % par mois seront appliquées de plein droit,
- une indemnité forfaitaire de recouvrement de 40 € sera exigible (art. D441-5 du Code de commerce),
- le Prestataire se réserve le droit de suspendre toute prestation en cours jusqu'à régularisation.`,
  },
  {
    title: "6. Obligations du Client",
    content: `Le Client s'engage à :
- fournir dans les délais convenus tous les éléments nécessaires à la réalisation de la prestation (contenus, accès, validations),
- désigner un interlocuteur unique disposant du pouvoir de décision,
- valider les livrables par écrit (email accepté).

Tout retard imputable au Client entraîne un report du planning sans pénalité pour le Prestataire. Si ce retard dépasse 30 jours, le Prestataire se réserve le droit de refacturer le temps de remise en contexte.`,
  },
  {
    title: "7. Délais de livraison",
    content: `Les délais de livraison sont précisés dans le devis. Creahub Solutions s'engage à mettre en œuvre tous les moyens raisonnables pour les respecter.

Le Prestataire ne pourra être tenu responsable d'un retard résultant d'un manquement du Client à ses obligations (fourniture de contenus, validation tardive, accès non transmis) ou d'un événement indépendant de sa volonté.`,
  },
  {
    title: "8. Propriété intellectuelle",
    content: `Tous les éléments créés dans le cadre de la prestation (code source, maquettes, livrables) restent la propriété intellectuelle de Creahub Solutions jusqu'au paiement intégral de la facture.

À réception du solde, les droits d'exploitation sont cédés au Client selon les modalités définies dans le devis. Cette cession est limitée à l'usage décrit au devis (non exclusive par défaut sauf mention contraire).

Creahub Solutions se réserve le droit de mentionner la réalisation dans son portfolio et ses supports de communication, sauf accord contraire explicite du Client.

Les éléments fournis par le Client (textes, images, marques) restent sa propriété. Il garantit en disposer des droits nécessaires et dégage le Prestataire de toute responsabilité à ce titre.`,
  },
  {
    title: "9. Responsabilité",
    content: `Creahub Solutions est soumise à une obligation de moyens. Elle ne pourra être tenue responsable :
- des dommages indirects (perte de chiffre d'affaires, perte de données, préjudice d'image),
- des problèmes liés à l'hébergement, aux CMS tiers, plugins ou services externes,
- des conséquences d'une utilisation non conforme des livrables par le Client.

La responsabilité du Prestataire est en tout état de cause limitée au montant total de la prestation facturée.`,
  },
  {
    title: "10. Garantie",
    content: `Le Prestataire garantit la correction des anomalies de fonctionnement imputables à son développement pendant 30 jours suivant la livraison finale, hors modifications apportées par le Client.

Cette garantie ne couvre pas :
- les évolutions ou nouvelles fonctionnalités (feront l'objet d'un nouveau devis),
- les dysfonctionnements liés à des mises à jour de CMS, plugins ou dépendances tiers,
- les problèmes d'hébergement ou d'infrastructure non gérés par le Prestataire.`,
  },
  {
    title: "11. Confidentialité & données personnelles",
    content: `Chaque partie s'engage à conserver confidentielles les informations échangées dans le cadre de la prestation et à ne pas les divulguer à des tiers sans accord préalable.

Dans le cadre du RGPD, si le Prestataire est amené à traiter des données personnelles pour le compte du Client, un accord de sous-traitance des données pourra être établi sur demande.

Les données transmises par le Client via le formulaire de contact du site sont utilisées uniquement aux fins de réponse et de gestion de la relation commerciale.`,
  },
  {
    title: "12. Force majeure",
    content: `Aucune des parties ne pourra être tenue responsable en cas de retard ou de non-exécution de ses obligations lorsqu'un tel manquement est dû à un cas de force majeure tel que défini par l'article 1218 du Code civil (catastrophes naturelles, grèves générales, pandémie, défaillance des réseaux de télécommunication, etc.).

La partie concernée devra en informer l'autre dans les meilleurs délais.`,
  },
  {
    title: "13. Modification & résiliation",
    content: `Toute modification du périmètre de la prestation devra faire l'objet d'un avenant écrit signé par les deux parties.

En cas de résiliation à l'initiative du Client :
- l'acompte versé reste acquis au Prestataire,
- les prestations réalisées jusqu'à la date de résiliation sont facturées au prorata.

En cas de résiliation à l'initiative du Prestataire (manquement grave du Client) :
- les sommes dues pour le travail réalisé restent exigibles,
- l'acompte est remboursé au prorata du travail non effectué.`,
  },
  {
    title: "14. Droit applicable & juridiction",
    content: `Les présentes CGV sont régies par le droit français.

En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.

À défaut d'accord amiable, le Tribunal Judiciaire de Toulouse sera exclusivement compétent, même en cas d'appel en garantie ou de pluralité de défendeurs.`,
  },
];

export default function CGV() {
  return (
    <>
      <Background />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 780,
          margin: "0 auto",
          padding: "100px 24px 80px",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "rgba(240,235,228,0.4)",
            marginBottom: 40,
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          ← Retour au site
        </a>

        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 999,
            border: "1px solid rgba(232,148,106,0.2)",
            background: "rgba(232,148,106,0.06)",
            fontSize: 11,
            color: "#e8946a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Conditions Générales de Vente
        </div>

        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          CGV – Creahub Solutions
        </h1>

        <p style={{ fontSize: 13, color: "rgba(240,235,228,0.35)", marginBottom: 56 }}>
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          {" "}· Ces CGV s'appliquent à toute commande passée auprès de Creahub Solutions.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {sections.map((s) => (
            <div
              key={s.title}
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "28px 0",
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e8946a",
                  marginBottom: 12,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h2>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: "rgba(240,235,228,0.65)",
                  whiteSpace: "pre-line",
                }}
              >
                {s.content}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            padding: "20px 24px",
            borderRadius: 12,
            background: "rgba(232,148,106,0.05)",
            border: "1px solid rgba(232,148,106,0.15)",
            fontSize: 13,
            color: "rgba(240,235,228,0.5)",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "rgba(240,235,228,0.8)" }}>Note :</strong> Ces CGV ont valeur informative.
          Pour toute question ou situation spécifique, n'hésitez pas à{" "}
          <a href="/#contact" style={{ color: "#e8946a" }}>me contacter directement</a>.
          Un accompagnement juridique professionnel est recommandé pour les contrats à enjeux importants.
        </div>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: 12,
          color: "rgba(240,235,228,0.2)",
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        © {new Date().getFullYear()} Creahub Solutions
      </footer>
    </>
  );
}
