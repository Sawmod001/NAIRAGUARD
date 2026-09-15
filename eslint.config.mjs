import nextCore from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCore,
  ...nextTs,
  {
    ignores: ["NairaGuard_Build_Pack/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
