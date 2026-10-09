import { ArrowRight, BriefcaseBusiness, HeartHandshake, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { InstagramIcon } from "../components/BrandIcons";
import actionImage from "../assets/acao-99-food-bags-brilho.png";
import teamImage from "../assets/equipe-reunida-brilho.png";
import promoterImage from "../assets/promotora-acao-vinho-enhanced.png";
import logoImage from "../assets/logo-enhanced.png";

const values = [
  { icon: UsersRound, title: "Pessoas no centro", text: "Conectamos talentos a oportunidades com uma seleção cuidadosa, humana e transparente." },
  { icon: Sparkles, title: "Presença que marca", text: "Valorizamos diferentes perfis, histórias e jeitos de fazer acontecer em cada produção." },
  { icon: HeartHandshake, title: "Parceria de verdade", text: "Do primeiro contato ao dia do trabalho, construímos relações profissionais e próximas." },
];

export function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="about-kicker">SPCASTING · REDE DE TALENTOS</span>
          <h1>Gente que faz<br /><em>acontecer.</em></h1>
          <p>Somos uma agência de casting que aproxima profissionais e produções, criando encontros que viram experiências memoráveis.</p>
          <div className="about-actions">
            <Link className="about-primary-action" to="/vagas">Ver oportunidades <ArrowRight size={17} /></Link>
            <a className="about-secondary-action" href="https://www.instagram.com/s.pcasting/" target="_blank" rel="noreferrer"><InstagramIcon size={17} /> @s.pcasting</a>
          </div>
        </div>
        <div className="about-hero-media">
          <img src={teamImage} alt="Equipe da SPCasting reunida em uma produção" fetchPriority="high" />
          <div className="about-logo-seal"><img src={logoImage} alt="SP Produções & Casting" /></div>
          <span className="about-photo-note">Nossa equipe. Nossa essência.</span>
        </div>
      </section>

      <section className="about-intro">
        <span>QUEM SOMOS</span>
        <div>
          <h2>O casting certo transforma uma ideia em presença.</h2>
          <p>A SPCasting nasceu para tornar o encontro entre talentos e oportunidades mais simples. Reunimos pessoas prontas para atuar em eventos, ações e produções, com uma curadoria atenta a cada projeto.</p>
        </div>
      </section>

      <section className="about-values" aria-label="Nossos valores">
        {values.map(({ icon: Icon, title, text }, index) => (
          <article key={title}><div className="about-value-number">0{index + 1}</div><Icon size={24} strokeWidth={1.5} /><h3>{title}</h3><p>{text}</p></article>
        ))}
      </section>

      <section className="about-gallery">
        <div className="about-gallery-heading">
          <div><span>POR TRÁS DO CASTING</span><h2>Nosso universo, de perto.</h2></div>
          <a href="https://www.instagram.com/s.pcasting/" target="_blank" rel="noreferrer">Seguir no Instagram <ArrowRight size={16} /></a>
        </div>
        <a className="about-gallery-grid" href="https://www.instagram.com/s.pcasting/" target="_blank" rel="noreferrer" aria-label="Visitar o Instagram da SPCasting">
          <div className="gallery-shot gallery-shot-one">
            <img src={actionImage} alt="Equipe da SPCasting em uma ação da 99 Food" loading="lazy" />
            <span><small>ATIVAÇÃO DE MARCA</small>Equipe em ação</span>
          </div>
          <div className="gallery-shot gallery-shot-two">
            <img src={promoterImage} alt="Promotora da SPCasting em ação de degustação" loading="lazy" />
            <span><small>EXPERIÊNCIA</small>Presença que conecta</span>
          </div>
          <div className="gallery-shot gallery-shot-three">
            <img src={teamImage} alt="Equipe da SPCasting durante uma produção" loading="lazy" />
            <span><small>SPCASTING</small>Quem faz acontecer</span>
          </div>
          <span className="gallery-instagram-badge"><InstagramIcon size={18} /> @s.pcasting</span>
        </a>
      </section>

      <section className="about-cta">
        <BriefcaseBusiness size={30} strokeWidth={1.4} />
        <div><span>PRONTO PARA O PRÓXIMO TRABALHO?</span><h2>Seu próximo job pode começar aqui.</h2></div>
        <Link to="/cadastro">Faça parte do casting <ArrowRight size={17} /></Link>
      </section>
    </div>
  );
}
