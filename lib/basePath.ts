const basePath = process.env.VERCEL
  ? ""
  : process.env.NODE_ENV === "production"
  ? "/Diaverzum_sajt_mock"
  : "";

export default basePath;
