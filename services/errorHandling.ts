export const isError = (error, req, res, next) => {
  console.log("ERR", error)
  res.status(error.status).send({ error: error.message });
};
