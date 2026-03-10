/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Diaverzum_sajt_mock",
  assetPrefix: "/Diaverzum_sajt_mock",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
