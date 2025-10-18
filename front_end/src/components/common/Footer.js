import React from 'react';
import { BarChart3, Mail, Github, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section principale */}
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand-logo">
              <BarChart3 size={24} />
              <span>AnalyseFinancière</span>
            </div>
            <p className="brand-description">
              Plateforme d'analyse financière intelligente utilisant l'IA pour 
              vous aider à prendre de meilleures décisions business.
            </p>
            <div className="social-links">
              <a href="mailto:support@analysefinanciere.com" className="social-link">
                <Mail size={18} />
              </a>
              <a href="https://github.com" className="social-link">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" className="social-link">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Produit</h4>
              <ul>
                <li><a href="/features">Fonctionnalités</a></li>
                <li><a href="/pricing">Tarifs</a></li>
                <li><a href="/demo">Démo</a></li>
                <li><a href="/updates">Nouveautés</a></li>
              </ul>
            </div>

            <div className="link-group">
              <h4>Ressources</h4>
              <ul>
                <li><a href="/documentation">Documentation</a></li>
                <li><a href="/tutorials">Tutoriels</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/support">Support</a></li>
              </ul>
            </div>

            <div className="link-group">
              <h4>Entreprise</h4>
              <ul>
                <li><a href="/about">À propos</a></li>
                <li><a href="/careers">Carrières</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/legal">Mentions légales</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section basse */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} AnalyseFinancière. Tous droits réservés.</p>
          </div>
          
          <div className="footer-legal">
            <a href="/privacy">Politique de confidentialité</a>
            <a href="/terms">Conditions d'utilisation</a>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;