import { Wordmark } from "@/components/BrandSprite";
import { footerGroups, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="section section--tight footer">
      <div className="wrap">
        <div className="footer__grid">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="footer__title">{group.title}</div>
              <ul className="footer__list">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Wordmark className="footer__mark mark" />

        <div className="footer__bar">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>O marketplace do entretenimento</span>
        </div>
      </div>
    </footer>
  );
}
