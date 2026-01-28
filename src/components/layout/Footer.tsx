import packageJson from "../../../package.json";

export function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
      <p>Family History v{packageJson.version}</p>
    </footer>
  );
}
