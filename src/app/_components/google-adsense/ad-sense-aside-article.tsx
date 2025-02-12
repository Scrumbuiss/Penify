import GoogleAdUnit from "./google-ad-unit";

const AdSenseAsideArticle = () => {
  return (
    <GoogleAdUnit>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          marginTop: "16px",
        }}
        data-ad-client=""
        data-ad-slot={""}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </GoogleAdUnit>
  );
};

export default AdSenseAsideArticle;
