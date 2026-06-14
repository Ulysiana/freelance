import type { Metadata } from "next";
import Background from "@/components/Background";

export const metadata: Metadata = {
  title: "CGV – Creahub Solutions",
  description: "Conditions Générales de Vente de Creahub Solutions — version en vigueur au 14 juin 2026.",
};

const sections = [
  {
    title: "Article 1 — Objet et champ d'application",
    content: `Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent l'ensemble des prestations de services proposées par Creahub Solutions, entrepreneur individuel, à ses clients professionnels (ci-après « le Client »).

Elles s'appliquent à :
- toute prestation de développement web ou applicatif facturée en régie horaire ;
- tout forfait packagé (Audit, Migration, Build ou autre) défini dans un devis ;
- tout abonnement ou prestation de maintenance récurrente ;
- toute vente de produits numériques ou accès à un service SaaS.

Toute commande passée auprès de Creahub Solutions implique l'acceptation pleine et entière des présentes CGV. En cas de contradiction entre les CGV et les dispositions d'un devis ou contrat particulier signé entre les parties, ce dernier prévaut.

Les présentes CGV sont réservées aux clients professionnels (personnes morales ou personnes physiques agissant dans le cadre de leur activité professionnelle). Elles ne s'appliquent pas aux transactions avec des consommateurs au sens du Code de la consommation.`,
  },
  {
    title: "Article 2 — Devis et formation du contrat",
    content: `Toute prestation fait l'objet d'un devis préalable établi par Creahub Solutions, transmis par voie électronique. Le devis précise :
- la nature et le périmètre des prestations ;
- le tarif applicable (taux horaire ou forfait) ;
- les délais indicatifs de réalisation ;
- les modalités de paiement et le montant de l'acompte.

Le devis est valable 30 jours calendaires à compter de sa date d'émission. Passé ce délai, Creahub Solutions se réserve le droit de le réviser.

Le contrat est formé à réception par Creahub Solutions du devis signé (ou de son bon pour accord écrit par e-mail) ET du versement de l'acompte prévu à l'Article 4. Aucun travail ne sera démarré avant réception de ces deux éléments.`,
  },
  {
    title: "Article 3 — Tarifs",
    content: `3.1 Régie horaire
Le taux horaire de référence est de 75 € HT de l'heure. Ce taux peut être révisé pour les nouvelles missions. Le taux en vigueur au moment de la signature du devis est celui applicable pour toute la durée de la mission concernée.
Le temps est comptabilisé par tranches de 30 minutes. Chaque tranche entamée est due.

3.2 Forfaits
Pour les prestations à périmètre défini (Audit, Migration, Build, etc.), un prix forfaitaire est indiqué dans le devis. Le forfait couvre exclusivement le périmètre décrit. Toute demande hors périmètre fera l'objet d'un avenant tarifaire.

3.3 Abonnements et maintenance récurrente
Les abonnements sont proposés selon deux formules :
- Formule mensuelle : facturée chaque mois à terme échu, sans engagement de durée. Résiliable à tout moment avec un préavis de 30 jours calendaires notifié par e-mail. Le service se poursuit jusqu'à l'expiration du préavis, sans remboursement de la période entamée.
- Formule annuelle : engagement sur 12 mois consécutifs, bénéficiant d'une réduction de 20 % sur le tarif mensuel de référence. Le paiement s'effectue, au choix du Client, en une seule fois à la souscription ou en 12 mensualités avec engagement ferme sur la durée. En cas de résiliation anticipée par le Client, le service se poursuit jusqu'à la fin de la période annuelle déjà commandée ; aucun remboursement au prorata n'est dû. En cas de paiement mensuel, les mensualités restantes jusqu'à la fin de la période annuelle demeurent exigibles.

La formule applicable est précisée dans le devis. En l'absence de mention, la formule mensuelle s'applique par défaut.

3.4 Produits numériques et SaaS
L'accès à un service SaaS ou la vente d'un produit numérique est soumis à des conditions tarifaires spécifiques définies sur la page de vente du produit concerné. Ces conditions prévalent sur les présentes CGV pour ce type de prestation.

3.5 TVA
Creahub Solutions bénéficie de la franchise en base de TVA conformément à l'article 293 B du Code Général des Impôts. La TVA n'est donc pas applicable aux prestations facturées. La mention « TVA non applicable — art. 293 B du CGI » figure sur toutes les factures.`,
  },
  {
    title: "Article 4 — Modalités de paiement",
    content: `4.1 Acompte
Un acompte de 30 % du montant total HT est exigible à la commande, avant tout démarrage des travaux. Le versement de cet acompte vaut confirmation de commande.

4.2 Solde et paiement progressif
Le solde est facturé selon la durée et la nature du projet, conformément aux échéances précisées dans le devis :
- Projet court (durée inférieure à 1 mois) : solde de 70 % à la livraison ou mise en production.
- Projet moyen (durée de 1 à 3 mois) : 40 % à l'atteinte d'un jalon intermédiaire défini au devis (ex. : validation de la maquette, déploiement en staging), puis 30 % à la livraison finale.
- Projet long (durée supérieure à 3 mois) : facturation mensuelle au prorata des heures réalisées, puis solde à la livraison finale.

Les jalons de facturation sont définis dans le devis. Toute échéance est liée à un livrable ou une étape identifiable. En l'absence de précision dans le devis, la structure « projet court » s'applique par défaut.

4.3 Délai de paiement
Les factures sont payables à réception, au plus tard dans un délai de 30 jours calendaires à compter de la date d'émission, sauf délai différent expressément mentionné sur la facture.

4.4 Modes de paiement
Le paiement s'effectue par virement bancaire (SEPA) aux coordonnées indiquées sur la facture, ou par tout autre moyen accepté par Creahub Solutions et précisé au devis.

4.5 Retard de paiement
Conformément aux articles L. 441-10 et suivants du Code de commerce, tout retard de paiement entraîne de plein droit, dès le lendemain de l'échéance :
- des pénalités de retard au taux de 3 fois le taux d'intérêt légal en vigueur, appliquées sur le montant HT de la facture impayée ;
- une indemnité forfaitaire pour frais de recouvrement de 40 € par facture en souffrance.

Creahub Solutions se réserve le droit de suspendre toute prestation en cours en cas de facture impayée au-delà de l'échéance, après mise en demeure restée sans effet sous 8 jours.

4.6 Facturation électronique
Creahub Solutions, en tant qu'entrepreneur individuel en franchise de TVA, n'est pas soumise à l'obligation d'émettre des factures électroniques structurées dans le cadre de la réforme de la facturation électronique B2B (ordonnance n° 2021-1190). Les factures sont émises au format PDF transmis par e-mail, ce qui constitue une facture électronique valide au sens de l'article 289 VII du CGI.
Si un Client assujetti à la TVA exige la réception de factures dans un format structuré (Factur-X, UBL, etc.) en application des obligations qui lui incombent, il en informe Creahub Solutions dès la commande. Les parties conviennent alors d'un format compatible dans les meilleurs délais, sans frais supplémentaires.`,
  },
  {
    title: "Article 5 — Obligations des parties",
    content: `5.1 Obligations de Creahub Solutions
Creahub Solutions s'engage à :
- réaliser les prestations avec soin, diligence et compétence, conformément aux règles de l'art ;
- respecter la confidentialité des informations transmises par le Client ;
- informer le Client sans délai de toute difficulté susceptible d'impacter les délais ou le périmètre de la mission ;
- livrer les travaux dans un état documenté et maintenable.

Creahub Solutions est soumise à une obligation de moyens et non de résultat, sauf stipulation contraire explicitement mentionnée dans le devis.

5.2 Obligations du Client
La bonne exécution de la prestation repose sur une collaboration active du Client. À ce titre, le Client s'engage à :
- fournir en temps utile tous les éléments nécessaires à la réalisation de la prestation (accès, contenus, visuels, informations techniques, identifiants) ;
- désigner un interlocuteur unique disposant de l'autorité nécessaire pour valider les livrables et prendre les décisions afférentes au projet ;
- répondre aux sollicitations de Creahub Solutions dans un délai de 5 jours ouvrés maximum, sauf accord contraire express ;
- valider ou formuler ses retours sur les livrables dans ce même délai ;
- régler les factures dans les délais convenus.

Le Client reconnaît que sa réactivité est une condition essentielle au respect des délais de livraison. Tout retard dans la transmission d'éléments, la validation de livrables ou la réponse aux demandes de Creahub Solutions entraîne automatiquement un report équivalent des délais contractuels, sans que ce report ne puisse être imputé à Creahub Solutions ni invoqué à son encontre.
Au-delà de 15 jours ouvrés sans réponse du Client à une sollicitation de Creahub Solutions, la mission pourra être considérée comme suspendue. La reprise de la mission fera l'objet d'une remise en planning selon les disponibilités de Creahub Solutions à cette date, sans garantie de respect des délais initiaux.`,
  },
  {
    title: "Article 6 — Délais de réalisation",
    content: `Les délais indiqués dans le devis sont donnés à titre indicatif et courent à compter de la réception de l'acompte ET de l'ensemble des éléments nécessaires au démarrage de la mission.

Creahub Solutions s'engage à informer le Client de tout dépassement prévisible dès qu'il en a connaissance. Les retards provoqués par le Client sont exclus du calcul des délais contractuels.`,
  },
  {
    title: "Article 7 — Propriété intellectuelle",
    content: `7.1 Cession des droits sur les livrables
Sauf mention contraire dans le devis, Creahub Solutions cède au Client, à titre exclusif et pour le monde entier, l'ensemble des droits patrimoniaux sur les livrables développés spécifiquement pour la mission (code source, maquettes, contenus), après règlement intégral des sommes dues.

7.2 Éléments tiers
Les composants open source, frameworks, thèmes, bibliothèques ou plugins tiers intégrés aux livrables restent soumis à leurs licences respectives. Creahub Solutions informera le Client des licences applicables si ces éléments imposent des contraintes particulières.

7.3 Droit de portfolio
Creahub Solutions se réserve le droit de mentionner le nom du Client et de présenter les livrables réalisés dans son portfolio et ses supports de communication, sauf demande expresse contraire notifiée par écrit.`,
  },
  {
    title: "Article 8 — Confidentialité",
    content: `Chacune des parties s'engage à garder confidentiels les informations et documents de l'autre partie dont elle pourrait avoir connaissance dans le cadre de l'exécution de la prestation, et à ne pas les divulguer à des tiers sans accord préalable écrit.

Cette obligation de confidentialité s'applique pendant toute la durée de la prestation et pendant 3 ans après sa fin, sauf pour les informations tombées dans le domaine public.`,
  },
  {
    title: "Article 9 — Résiliation",
    content: `9.1 Résiliation par le Client
Le Client peut résilier la mission à tout moment par e-mail. Les heures et travaux réalisés jusqu'à la date de résiliation sont dus et feront l'objet d'une facturation au prorata. L'acompte versé reste acquis à Creahub Solutions en compensation des travaux engagés et de l'immobilisation du planning.

9.2 Résiliation par Creahub Solutions
Creahub Solutions peut résilier la mission en cas de manquement grave du Client (non-paiement, absence de collaboration rendant la mission impossible) après mise en demeure restée sans effet sous 15 jours calendaires. Les sommes dues pour les travaux réalisés restent exigibles.`,
  },
  {
    title: "Article 10 — Limitation de responsabilité",
    content: `La responsabilité de Creahub Solutions est limitée au montant HT effectivement facturé et réglé par le Client au titre de la prestation concernée.

Creahub Solutions ne saurait être tenue responsable des dommages indirects (perte de chiffre d'affaires, perte de données, manque à gagner, préjudice d'image) subis par le Client.

Creahub Solutions ne peut être tenue responsable des dysfonctionnements résultant de l'utilisation par le Client de composants tiers, de modifications apportées par le Client ou un tiers aux livrables livrés, ou de causes extérieures (panne d'hébergeur, force majeure, etc.).`,
  },
  {
    title: "Article 11 — Force majeure",
    content: `Aucune partie ne peut être tenue responsable d'un manquement à ses obligations contractuelles causé par un événement de force majeure au sens de l'article 1218 du Code civil. La partie concernée doit en informer l'autre sans délai. Si l'événement persiste au-delà de 30 jours, chaque partie peut résilier la mission sans indemnité, sous réserve du paiement des travaux réalisés.`,
  },
  {
    title: "Article 12 — Droit applicable et litiges",
    content: `Les présentes CGV sont soumises au droit français.

En cas de litige, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours à compter de la notification du désaccord par e-mail avec accusé de réception.

À défaut de résolution amiable, le litige sera soumis aux tribunaux compétents du ressort de Muret (31), nonobstant pluralité de défendeurs ou appel en garantie.`,
  },
  {
    title: "Article 13 — Données personnelles",
    content: `Dans le cadre de l'exécution des prestations, Creahub Solutions peut être amenée à traiter des données personnelles relatives aux contacts du Client. Ces traitements sont effectués dans le respect du Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et de la loi Informatique et Libertés.

Les données collectées (nom, prénom, adresse e-mail, coordonnées professionnelles) sont utilisées uniquement pour la gestion de la relation contractuelle et ne sont pas transmises à des tiers sans consentement, sauf obligation légale.

Le Client dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données en contactant : contact@creahub-solutions.fr`,
  },
  {
    title: "Article 14 — Dispositions diverses",
    content: `Si l'une des clauses des présentes CGV était déclarée nulle ou inapplicable, les autres clauses resteraient en vigueur.

Le fait pour Creahub Solutions de ne pas se prévaloir d'une stipulation des présentes CGV ne saurait être interprété comme une renonciation à s'en prévaloir ultérieurement.

Creahub Solutions se réserve le droit de modifier les présentes CGV à tout moment. La version applicable est celle en vigueur au jour de la signature du devis.`,
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

        <p style={{ fontSize: 13, color: "rgba(240,235,228,0.35)", marginBottom: 32 }}>
          Version en vigueur au 14 juin 2026 · Ces CGV s'appliquent à toute commande passée auprès de Creahub Solutions.
        </p>

        <div
          style={{
            padding: "20px 24px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 13,
            lineHeight: 1.8,
            color: "rgba(240,235,228,0.6)",
            marginBottom: 48,
            whiteSpace: "pre-line",
          }}
        >
          {`Creahub Solutions — Corinne LIOT, entrepreneur individuel
4 rue du Chanoine Bonhoure, 31600 Muret, France
SIREN : 908 329 832 — SIRET : 908 329 832 00012 — APE : 6201Z
N° TVA intracommunautaire : FR33908329832 (non collecteur — franchise art. 293 B CGI)
contact@creahub-solutions.fr — https://creahub-solutions.fr`}
        </div>

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
          <strong style={{ color: "rgba(240,235,228,0.8)" }}>Une question sur ces conditions ?</strong>{" "}
          N'hésitez pas à{" "}
          <a href="/#contact" style={{ color: "#e8946a" }}>me contacter directement</a>.
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
        © {new Date().getFullYear()} Creahub Solutions — CGV version du 14 juin 2026
      </footer>
    </>
  );
}
