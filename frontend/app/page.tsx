import { HomeExperience } from "../components/home-experience";

const services = [
  "dental cleaning",
  "oil change",
  "plumbing",
  "home cleaning",
  "haircut",
];

export default function HomePage() {
  return <HomeExperience services={services} />;
}
