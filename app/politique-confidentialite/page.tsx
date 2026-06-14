import type { Metadata } from "next";
import Background from "@/components/Background";

export const metadata: Metadata = {
  title: "Politique de confidentialité – Creahub Solutions",
  description:
    "Politique de confidentialité et gestion des cookies de Creahub Solutions, conforme au RGPD.",
};

const sections = [
  {
    title: "1. Responsable du traitement",
    content: `Le responsable du traitement des données collectées sur ce site est :

Creahub Solutions – EI Corinne LIOT
SIREN : 908 329 832 | SIRET : 908 329 832 00012
4 Rue du Chanoine Bonhoure, 31600 Muret, France
Contact : contact@creahub-solutions.fr

ci-après désigné « le Responsable de traitement ».`,
  },
  {
    title: "2. Données collectées",
    content: `Ce site collecte un minimum de données, uniquement dans les cas suivants :

- Formulaire de contact : nom, adresse email et contenu du message que vous nous transmettez volontairement.
- Espace client (si vous y avez accès) : email et données de connexion nécessaires à votre authentification.

Aucune donnée n'est collectée à votre insu. Ce site n'utilise pas d'outils de publicité ciblée ni de revente de données.`,
  },
  {
    title: "3. Finalités & base légale",
    content: `Les données sont traitées pour les finalités suivantes :

- Répondre à vos demandes envoyées via le formulaire de contact et assurer le suivi de la relation commerciale (base légale : votre consentement et l'intérêt légitime à répondre à votre sollicitation).
- Permettre l'authentification et l'accès sécurisé à l'espace client (base légale : l'exécution de la prestation).

Vos données ne sont jamais utilisées à d'autres fins que celles décrites ci-dessus.`,
  },
  {
    title: "4. Cookies",
    content: `Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement :

- Cookies de session : ils permettent de maintenir votre authentification lorsque vous accédez à l'espace client. Ils sont supprimés à la fermeture de votre session ou à l'expiration de celle-ci.
- Stockage local (cookie banner) : un indicateur enregistré dans votre navigateur mémorise que vous avez pris connaissance de cette bannière, pour ne pas vous la réafficher.

Ce site n'utilise pas de cookies de mesure d'audience, de traçage publicitaire ni de réseaux sociaux tiers. Ces cookies techniques ne nécessitent pas de consentement préalable au sens de la réglementation.`,
  },
  {
    title: "5. Destinataires & hébergement",
    content: `Vos données ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales.

Elles peuvent être traitées par les prestataires techniques nécessaires au fonctionnement du site, agissant comme sous-traitants au sens du RGPD :

- Hébergement de l'application : Google Cloud (Cloud Run), au sein de l'Union européenne.
- Base de données : Neon, hébergement au sein de l'Union européenne.

Ces prestataires sont tenus à des obligations de sécurité et de confidentialité conformes au RGPD.`,
  },
  {
    title: "6. Durée de conservation",
    content: `Les données sont conservées pour une durée limitée :

- Messages envoyés via le formulaire de contact : conservés le temps nécessaire au traitement de votre demande et à la relation commerciale, puis archivés ou supprimés (au maximum 3 ans après le dernier contact).
- Données liées à un contrat ou une facturation : conservées conformément aux obligations légales et comptables (jusqu'à 10 ans pour les pièces comptables).
- Cookies de session : durée de la session uniquement.`,
  },
  {
    title: "7. Vos droits",
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés », vous disposez des droits suivants sur vos données :

- droit d'accès,
- droit de rectification,
- droit à l'effacement (« droit à l'oubli »),
- droit à la limitation du traitement,
- droit d'opposition,
- droit à la portabilité de vos données.

Pour exercer ces droits, il vous suffit d'en faire la demande par email à contact@creahub-solutions.fr. Une réponse vous sera apportée dans un délai maximum d'un mois.`,
  },
  {
    title: "8. Réclamation",
    content: `Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à l'autorité de contrôle compétente :

Commission Nationale de l'Informatique et des Libertés (CNIL)
3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
www.cnil.fr`,
  },
  {
    title: "9. Modification de la politique",
    content: `Cette politique de confidentialité peut être amenée à évoluer, notamment pour rester conforme à la réglementation en vigueur. La date de dernière mise à jour est indiquée en haut de cette page. Nous vous invitons à la consulter régulièrement.`,
  },
];

export default function PolitiqueConfidentialite() {
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
          Politique de confidentialité
        </div>

        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Politique de confidentialité
        </h1>

        <p style={{ fontSize: 13, color: "rgba(240,235,228,0.35)", marginBottom: 56 }}>
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          {" "}· Protection de vos données personnelles conformément au RGPD.
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
          <strong style={{ color: "rgba(240,235,228,0.8)" }}>Une question sur vos données ?</strong>{" "}
          N'hésitez pas à{" "}
          <a href="/#contact" style={{ color: "#e8946a" }}>me contacter directement</a>.
          Je réponds à toute demande relative à vos données dans un délai maximum d'un mois.
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
