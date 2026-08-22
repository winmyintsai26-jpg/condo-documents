import { Building2 } from "lucide-react";
import { siteConfig } from "../config/site";
export function PropertyMark() { return <span className="property-mark" aria-hidden="true">{siteConfig.logoUrl ? <span className="property-logo" style={{ backgroundImage: `url(${siteConfig.logoUrl})` }} /> : <Building2 size={21} strokeWidth={1.7} />}</span>; }
