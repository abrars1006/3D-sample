"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "@/components/SmoothScroll";
import { flavors, type Flavor } from "@/lib/flavors";

gsap.registerPlugin(ScrollTrigger);

const CanScene = dynamic(() => import("@/components/CanScene"), {
  ssr: false,
  loading: () => <div className="can-loading" aria-hidden="true" />,
});

const ingredients = [
  { icon: "☼", title: "Green tea", copy: "A gentler lift, from real tea leaves.", color: "#e9c866" },
  { icon: "✳", title: "B vitamins", copy: "The little helpers behind big days.", color: "#7a9c77" },
  { icon: "↗", title: "Just-right caffeine", copy: "80 mg to meet your moment.", color: "#e99b77" },
];

const questions = [
  { question: "What’s the energy like?", answer: "A smooth 80 mg of caffeine from green tea, with B vitamins along for the ride. Think focused, feel-good energy—not a rocket launch." },
  { question: "Is Solstice very sweet?", answer: "Nope. Every can has a bright, fruit-forward taste with zero added sugar and only 15 calories. Refreshing first, sweet second." },
  { question: "What’s in a can?", answer: "Sparkling water, real fruit flavor, green tea caffeine, B vitamins, and a little sunshine. Every ingredient earns its place." },
  { question: "Where can I find Solstice?", answer: "Coming soon to your favorite neighborhood market, studio fridge, and right here online. Join our list to get first sip access." },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className={`arrow-icon${diagonal ? " arrow-diagonal" : ""}`}>↗</span>;
}

function FAQItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const answerElement = answerRef.current;
    if (!answerElement) return;
    gsap.to(answerElement, {
      height: isOpen ? "auto" : 0,
      opacity: isOpen ? 1 : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.42,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, [isOpen]);

  return (
    <article className={`faq-item${isOpen ? " is-open" : ""}`}>
      <button className="faq-question" type="button" aria-expanded={isOpen} onClick={onToggle}>
        <span className="faq-index">0{index + 1}</span>
        <span>{question}</span>
        <span className="faq-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <div className="faq-answer" ref={answerRef} aria-hidden={!isOpen}>
        <p>{answer}</p>
      </div>
    </article>
  );
}

export default function Home() {
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor>(flavors[0]);
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const rotationTarget = useRef({ value: 0 });
  const cameraTarget = useRef({ value: 0 });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (!reduceMotion) {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.6 })
          .from(".hero-title-line", { yPercent: 110, duration: 0.9, stagger: 0.13 }, "-=0.25")
          .from(".hero-copy, .hero-actions, .hero-note", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.45")
          .from(".hero-product", { opacity: 0, scale: 0.86, duration: 1.15 }, "-=0.9");

        gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
          gsap.fromTo(
            element,
            { y: 48, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 86%", once: true },
            },
          );
        });

        gsap.to(rotationTarget.current, {
          value: Math.PI * 2,
          ease: "none",
          scrollTrigger: {
            trigger: "#experience",
            start: "top top",
            end: "+=100%",
            scrub: 1,
            pin: "#experience",
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
        gsap.to(cameraTarget.current, {
          value: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#experience",
            start: "top top",
            end: "+=100%",
            scrub: 1.2,
          },
        });
        gsap.to(".experience-orbit", {
          rotate: 14,
          ease: "none",
          scrollTrigger: { trigger: "#experience", start: "top bottom", end: "bottom top", scrub: true },
        });
      } else {
        gsap.set(".hero-eyebrow, .hero-title-line, .hero-copy, .hero-actions, .hero-note, .hero-product, .reveal", {
          opacity: 1,
          clearProps: "transform",
        });
      }
    }, root);

    return () => context.revert();
  }, []);

  const selectFlavor = (flavor: Flavor) => {
    if (flavor.name === selectedFlavor.name) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(rotationTarget.current, {
        value: rotationTarget.current.value + Math.PI * 0.85,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }
    setSelectedFlavor(flavor);
  };

  return (
    <>
      <SmoothScroll />
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Solstice home">
          <span className="brand-sun">✳</span>
          <span>SOLSTICE</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#flavors">The flavors</a>
          <a href="#ingredients">What’s inside</a>
          <a href="#story">Our story</a>
        </nav>
        <a className="header-cta" href="#flavors">Find your flavor <ArrowIcon /></a>
      </header>

      <main ref={mainRef}>
        <section className="hero-section" id="top">
          <div className="hero-grain" aria-hidden="true" />
          <div className="hero-copy-block">
            <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> A LITTLE MORE DAYLIGHT</p>
            <h1 className="hero-title">
              <span className="title-mask"><span className="hero-title-line">Energy,</span></span>
              <span className="title-mask"><span className="hero-title-line title-italic">in a brighter</span></span>
              <span className="title-mask"><span className="hero-title-line">light.</span></span>
            </h1>
            <p className="hero-copy">A bright spark for the in-between moments. Made with green tea, good things, and no big energy-drink energy.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#flavors">Meet your match <ArrowIcon /></a>
              <span className="hero-note">80 mg green tea caffeine<br />15 calories · 0g added sugar</span>
            </div>
          </div>
          <div className="hero-product" aria-hidden="true">
            <div className="hero-halo" />
            <span className="hero-sticker sticker-top">A GOOD<br />KIND OF<br />BUZZ <i>✳</i></span>
            <CanScene flavor={selectedFlavor} rotationTarget={rotationTarget.current} className="hero-can-scene" />
            <span className="hero-sticker sticker-bottom"><span>01</span> / 06<br />SIP INTO<br />SUNSHINE</span>
          </div>
          <div className="hero-bottom">
            <span>NEW ENERGY FOR YOUR EVERYDAY</span>
            <a href="#experience">SCROLL A LITTLE <span className="scroll-line" /></a>
            <span>MADE FOR THE MOMENT YOU’RE IN</span>
          </div>
          <span className="hero-side-note">A brighter kind of energy — est. whenever you need it</span>
        </section>

        <section className="experience-section" id="experience">
          <div className="experience-stage">
            <div className="experience-wash" />
            <div className="experience-heading reveal">
              <p className="eyebrow"><span className="eyebrow-dot" /> THE CAN, UP CLOSE</p>
              <h2>Good things<br /><span>in a little can.</span></h2>
            </div>
            <CanScene flavor={selectedFlavor} rotationTarget={rotationTarget.current} cameraTarget={cameraTarget.current} interactive className="experience-can-scene" />
            <div className="experience-caption">
              <span className="caption-index">01—06</span>
              <span>Turn it around. There’s more to it.</span>
              <span className="caption-orbit">360°</span>
            </div>
            <div className="experience-orbit" aria-hidden="true"><span>REAL INGREDIENTS · REAL GOOD DAYS · </span></div>
          </div>
        </section>

        <section className="flavor-section section-pad" id="flavors">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> SIX LITTLE MOOD-BOOSTERS</p>
              <h2>Pick your<br /><span>kind of bright.</span></h2>
            </div>
            <p className="section-intro">All the lift. None of the loud. Find the flavor that feels like your kind of day.</p>
          </div>
          <div className="flavor-display" style={{ "--flavor-color": selectedFlavor.color, "--flavor-accent": selectedFlavor.accent } as React.CSSProperties}>
            <div className="flavor-art" aria-hidden="true">
              <span className="flavor-blob blob-one" />
              <span className="flavor-blob blob-two" />
              <span className="flavor-sunburst">✳</span>
              <span className="flavor-fruit">{selectedFlavor.fruit}</span>
            </div>
            <div className="flavor-can-wrap">
              <CanScene flavor={selectedFlavor} rotationTarget={rotationTarget.current} className="flavor-can-scene" />
            </div>
            <div className="flavor-description">
              <span className="flavor-number">FLAVOR NO. {selectedFlavor.number}</span>
              <h3 key={selectedFlavor.name}>{selectedFlavor.shortName}</h3>
              <p>{selectedFlavor.note}</p>
              <a href="#ingredients" className="text-link">What makes it special <ArrowIcon /></a>
            </div>
          </div>
          <div className="flavor-picker" role="group" aria-label="Choose a Solstice flavor">
            {flavors.map((flavor) => (
              <button
                type="button"
                key={flavor.name}
                className={`flavor-option${selectedFlavor.name === flavor.name ? " active" : ""}`}
                style={{ "--swatch-color": flavor.color } as React.CSSProperties}
                onClick={() => selectFlavor(flavor)}
                aria-pressed={selectedFlavor.name === flavor.name}
              >
                <span className="flavor-swatch" />
                <span>{flavor.shortName}</span>
                <span className="flavor-option-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="ingredients-section section-pad" id="ingredients">
          <div className="ingredients-heading reveal">
            <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> NOTHING EXTRA. NOTHING TO HIDE.</p>
            <h2>A feel-good<br /><span>kind of formula.</span></h2>
            <p>Thoughtful ingredients. A little sparkle. Zero weird stuff. That’s the whole recipe.</p>
          </div>
          <div className="ingredient-orbit ingredient-orbit-one" aria-hidden="true">✳</div>
          <div className="ingredient-orbit ingredient-orbit-two" aria-hidden="true">◌</div>
          <div className="ingredient-cards">
            {ingredients.map((ingredient, index) => (
              <article className="ingredient-card reveal" key={ingredient.title} style={{ "--ingredient-tint": ingredient.color } as React.CSSProperties}>
                <span className="ingredient-number">0{index + 1} / GOOD STUFF</span>
                <span className="ingredient-illustration" aria-hidden="true">{ingredient.icon}</span>
                <div>
                  <h3>{ingredient.title}</h3>
                  <p>{ingredient.copy}</p>
                </div>
                <span className="ingredient-spark" aria-hidden="true">✳</span>
              </article>
            ))}
          </div>
          <div className="ingredients-footnote"><span>✳</span> ALL THE GOOD BITS. NONE OF THE NOISY ONES.</div>
        </section>

        <section className="story-section" id="story">
          <div className="story-art">
            <div className="story-sun" />
            <div className="story-landscape landscape-back" />
            <div className="story-landscape landscape-front" />
            <span className="story-art-label">TAKE THE<br />SCENIC ROUTE <b>↗</b></span>
            <span className="story-art-caption">SOMEWHERE BETWEEN HERE & A BETTER DAY</span>
          </div>
          <div className="story-copy reveal">
            <p className="eyebrow"><span className="eyebrow-dot" /> A NOTE FROM SOLSTICE</p>
            <h2>For the days<br />that need a<br /><span>little lift.</span></h2>
            <p>We made Solstice for real life. The early starts, long walks, one-more-thing afternoons, and those rare, lovely moments when everything clicks.</p>
            <p>No crash-course energy. No complicated promises. Just a bright, thoughtful little boost that helps the day feel like yours again.</p>
            <a href="#faqs" className="text-link">A little more about us <ArrowIcon /></a>
          </div>
        </section>

        <section className="faq-section section-pad" id="faqs">
          <div className="faq-intro reveal">
            <p className="eyebrow"><span className="eyebrow-dot" /> THE LITTLE DETAILS</p>
            <h2>Good question.</h2>
            <p>We like knowing what’s in our can, too. Here are a few things you might be wondering.</p>
            <a href="mailto:hello@drinksolstice.com" className="text-link">Still curious? Say hello <ArrowIcon /></a>
          </div>
          <div className="faq-list">
            {questions.map((item, index) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                index={index}
                isOpen={openQuestion === index}
                onToggle={() => setOpenQuestion(openQuestion === index ? null : index)}
              />
            ))}
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-sun" aria-hidden="true">✳</div>
          <p className="eyebrow eyebrow-light">YOUR DAY, WITH A LITTLE MORE GLOW</p>
          <h2>Here’s to a<br /><span>brighter</span> in-between.</h2>
          <a className="button button-light" href="#flavors">Find your flavor <ArrowIcon /></a>
          <p className="closing-note">Small can. Good plans.</p>
        </section>

        <footer className="site-footer">
          <div className="footer-top">
            <a className="brand-lockup footer-brand" href="#top"><span className="brand-sun">✳</span><span>SOLSTICE</span></a>
            <p>Energy, in a brighter light.</p>
            <a href="mailto:hello@drinksolstice.com" className="footer-email">Say hello <ArrowIcon /></a>
          </div>
          <div className="footer-bottom">
            <span>© 2025 SOLSTICE ENERGY CO.</span>
            <nav aria-label="Footer navigation">
              <a href="#flavors">Flavors</a>
              <a href="#ingredients">Ingredients</a>
              <a href="#story">Our story</a>
              <a href="#faqs">FAQs</a>
            </nav>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">TK</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
