import countries from "world-countries";

const formattedCountries = countries.map((country) => ({
  value: country.cca2,               // ✅ "IN"
  label: `${country.name.common} ${country.flag}`, // India 🇮🇳
  latlng: country.latlng,
  region: country.region,
  name: country.name.common,          // optional helper
}));

const useCountries = () => {
  const getAll = () => formattedCountries;

  const getByValue = (value: string) =>
    formattedCountries.find((item) => item.value === value);

  return {
    getAll,
    getByValue,
  };
};

export default useCountries;
