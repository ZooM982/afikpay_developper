import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, Database } from 'lucide-react';

const PageHeader = ({ title, icon: Icon, description }) => (
  <div className="bg-slate-50 dark:bg-secondary-950 border-b border-slate-200 dark:border-secondary-900 pt-24 pb-12">
    <div className="container mx-auto px-4 max-w-4xl text-center">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{description}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">{title}</h2>
    <div className="text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
      {children}
    </div>
  </section>
);

export const PrivacyPolicy = () => (
  <div className="font-sans bg-white dark:bg-secondary-950 min-h-screen">
    <PageHeader 
      title="Politique de Confidentialité" 
      icon={Database}
      description="Déclaration de protection des données personnelles conformément à la législation sénégalaise (Loi n° 2008-12)."
    />
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <Section title="1. Cadre Légal et Réglementaire">
        <p>Conformément à la Loi n° 2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel au Sénégal, AfriKPay s'engage à protéger la vie privée des utilisateurs de son API. Nos traitements de données sont déclarés auprès de la Commission de Protection des Données Personnelles (CDP) du Sénégal.</p>
      </Section>
      <Section title="2. Données Collectées">
        <p>Lors de l'utilisation de l'API AfriKPay, nous collectons les données suivantes :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Données d'identification :</strong> Nom de l'entreprise, NINEA, Registre de Commerce (RCCM), nom du représentant légal, adresses emails et numéros de téléphone.</li>
          <li><strong>Données de transaction :</strong> Numéros de téléphone des expéditeurs/bénéficiaires (masqués/hachés lorsque la loi l'exige), montants, devises, et références des transactions.</li>
          <li><strong>Données techniques :</strong> Adresses IP, logs de connexion, clés API utilisées, et user-agents.</li>
        </ul>
      </Section>
      <Section title="3. Finalité du Traitement">
        <p>Les données sont collectées pour :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>L'exécution des services de paiement et l'acheminement des fonds via les opérateurs partenaires (Wave, Orange Money, etc.).</li>
          <li>La lutte contre le blanchiment de capitaux et le financement du terrorisme (LBC/FT), en conformité avec les directives de la BCEAO.</li>
          <li>La gestion de la relation client (support technique) et l'amélioration de notre infrastructure.</li>
        </ul>
      </Section>
      <Section title="4. Hébergement et Transfert">
        <p>Toutes nos données sont hébergées sur des serveurs sécurisés. Conformément à la législation de la CDP, tout transfert de données hors du Sénégal vers des prestataires cloud tiers fait l'objet d'un encadrement juridique strict garantissant un niveau de protection adéquat.</p>
      </Section>
      <Section title="5. Vos Droits">
        <p>En vertu de la Loi n° 2008-12, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant vos données. Vous pouvez exercer ces droits en nous contactant à <strong>privacy@afrikpay.tech</strong>.</p>
      </Section>
    </div>
  </div>
);

export const TermsOfService = () => (
  <div className="font-sans bg-white dark:bg-secondary-950 min-h-screen">
    <PageHeader 
      title="Conditions Générales d'Utilisation (CGU/CGV)" 
      icon={FileText}
      description="Règles régissant l'utilisation de l'API AfriKPay et les transactions électroniques."
    />
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <Section title="1. Objet">
        <p>Les présentes Conditions Générales régissent la fourniture de services d'agrégation de paiement par AfriKPay aux Marchands. Elles sont rédigées en conformité avec la Loi n° 2008-08 sur les transactions électroniques au Sénégal.</p>
      </Section>
      <Section title="2. Accès à l'API">
        <p>L'accès à l'API de production d'AfriKPay est conditionné par la validation du compte Marchand (processus KYC/KYB). Le Marchand s'engage à fournir des documents légaux authentiques (RCCM, NINEA, CNI du gérant).</p>
      </Section>
      <Section title="3. Obligations du Marchand">
        <p>Le Marchand s'engage à :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Protéger la confidentialité de ses clés API (clés secrètes). En cas de compromission, AfriKPay doit être notifié immédiatement.</li>
          <li>Ne pas utiliser la plateforme pour des activités illicites (fraude, vente de produits prohibés par la loi sénégalaise, blanchiment d'argent).</li>
          <li>Se conformer aux réglementations de la BCEAO régissant la monnaie électronique et les paiements digitaux.</li>
        </ul>
      </Section>
      <Section title="4. Responsabilités">
        <p>AfriKPay agit en tant qu'intermédiaire technique. La responsabilité d'AfriKPay ne saurait être engagée en cas de défaillance des réseaux des opérateurs télécoms ou bancaires partenaires. La responsabilité financière d'AfriKPay est strictement limitée aux montants des transactions en litige.</p>
      </Section>
      <Section title="5. Tarification et Règlements">
        <p>Les frais applicables sont ceux indiqués sur la page "Tarifs". AfriKPay procède au reversement (payout) des fonds collectés vers le compte bancaire ou mobile money du Marchand selon les délais convenus contractuellement (T+1 ou T+2), déduction faite des commissions.</p>
      </Section>
      <Section title="6. Droit Applicable et Juridiction Compétente">
        <p>Ces conditions sont régies par le droit sénégalais. Tout litige non résolu à l'amiable sera soumis à la compétence exclusive des tribunaux de Dakar.</p>
      </Section>
    </div>
  </div>
);

export const CookiesPolicy = () => (
  <div className="font-sans bg-white dark:bg-secondary-950 min-h-screen">
    <PageHeader 
      title="Politique des Cookies" 
      icon={Database}
      description="Transparence sur l'utilisation des cookies et traceurs sur notre plateforme."
    />
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <Section title="1. Qu'est-ce qu'un cookie ?">
        <p>Un cookie est un petit fichier texte stocké sur votre terminal lors de la visite du portail développeur AfriKPay. Ils nous aident à faire fonctionner le site et à améliorer votre expérience.</p>
      </Section>
      <Section title="2. Cookies Utilisés">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Cookies strictement nécessaires :</strong> Ils sont indispensables pour vous connecter au tableau de bord (ex: jeton d'authentification) et sécuriser vos sessions. Ils ne peuvent être désactivés.</li>
          <li><strong>Cookies de performance :</strong> Nous utilisons des outils d'analyse pour comprendre comment les développeurs interagissent avec notre documentation afin de l'améliorer.</li>
          <li><strong>Cookies de préférences :</strong> Ils mémorisent vos choix, comme le thème (clair/sombre).</li>
        </ul>
      </Section>
      <Section title="3. Consentement">
        <p>Conformément aux recommandations de la CDP, le dépôt de cookies non essentiels requiert votre consentement préalable. Vous pouvez modifier vos préférences à tout moment via les paramètres de votre navigateur.</p>
      </Section>
    </div>
  </div>
);

export const SecurityPolicy = () => (
  <div className="font-sans bg-white dark:bg-secondary-950 min-h-screen">
    <PageHeader 
      title="Sécurité et Conformité" 
      icon={ShieldCheck}
      description="Notre engagement pour la protection de vos transactions et la cybersécurité."
    />
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <Section title="1. Infrastructure Sécurisée">
        <p>L'infrastructure d'AfriKPay est conçue avec une approche "Security by Design". Toutes les requêtes vers notre API doivent utiliser le protocole HTTPS (TLS 1.2 minimum) pour chiffrer les données en transit.</p>
      </Section>
      <Section title="2. Lutte contre la Cybercriminalité">
        <p>En accord avec la Loi n° 2008-11 sur la cybercriminalité au Sénégal, nous mettons en œuvre :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Des pare-feu applicatifs (WAF) pour contrer les attaques DDoS et les injections SQL.</li>
          <li>Une surveillance active des logs avec détection d'anomalies.</li>
          <li>Un blocage automatique des adresses IP suspectes.</li>
        </ul>
      </Section>
      <Section title="3. Conformité Financière">
        <p>Nos systèmes respectent les exigences de sécurité édictées par la BCEAO pour les agrégateurs de paiement, incluant la réconciliation stricte des flux financiers et la ségrégation des comptes marchands.</p>
      </Section>
      <Section title="4. Signalement d'un Incident">
        <p>Si vous êtes un chercheur en sécurité ou un développeur et que vous identifiez une vulnérabilité sur notre API, nous vous encourageons à nous contacter immédiatement à <strong>security@afrikpay.tech</strong>. Nous nous engageons à traiter les signalements avec la plus grande célérité.</p>
      </Section>
    </div>
  </div>
);
