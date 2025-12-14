import { useEffect, useState } from "react";

function Quotes() {
  const [quote, setQuote] = useState("Loading quote...");

  useEffect(() => {
    fetch("https://api.quotable.io/random")
      .then((res) => res.json())
      .then((data) => setQuote(data.content))
      .catch(() => setQuote("Stay strong. You are not alone."));
  }, []);

  return (
    <section className="quotes">
      <h3>Motivational Quote</h3>
      <p>"{quote}"</p>
    </section>
  );
}

export default Quotes;
