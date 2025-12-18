import { useIntlayer } from "react-intlayer";
import { LanguageSwitch } from "~/components/UI/LanguageSwitch";

export default function Nav() {
  const { nav: content } = useIntlayer("app");

  return (
    <nav className="w-full h-14 flex items-center justify-between border-b z-50">
      <h1 className="text-3xl">{content.title}</h1>
      <LanguageSwitch />
    </nav>
  );
}
