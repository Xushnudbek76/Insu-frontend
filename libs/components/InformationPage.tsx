import Head from 'next/head';
import NextLink from 'next/link';

interface InformationSection {
  heading: string;
  text: string;
}

export default function InformationPage({ title, intro, sections }: { title: string; intro: string; sections: InformationSection[] }) {
  return (
    <article className="information-page">
      <Head><title>{title} | INSU</title><meta name="description" content={intro} /></Head>
      <p className="eyebrow">INSU</p>
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
      {sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}
      <nav aria-label="Information links"><NextLink href="/cs">Help center</NextLink><NextLink href="/about">About</NextLink><NextLink href="/privacy">Privacy</NextLink><NextLink href="/terms">Terms</NextLink></nav>
      <style jsx>{`
        .information-page { width: min(100%, 850px); margin: 0 auto; padding: 70px 24px 90px; color: #19232f; }
        .eyebrow { color: #4539e8; font-weight: 700; letter-spacing: .12em; }
        h1 { font-size: clamp(32px, 5vw, 52px); line-height: 1.15; margin: 18px 0 24px; }
        .intro { font-size: 20px; color: #526175; }
        section { margin-top: 34px; }
        h2 { font-size: 24px; margin-bottom: 12px; }
        p { line-height: 1.75; }
        nav { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 40px; }
        nav :global(a) { color: #4539e8; text-decoration: underline; }
      `}</style>
    </article>
  );
}
