const test = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/check-connection`
  );
  console.log(response.data);
}; 