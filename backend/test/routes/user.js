describe("/users", () => {
  it("/search?q=nickname", async () => {
    let st = "_";
    // let a = await server
    //   .get(`/api/users/search?q=${st}`)
    //   .set(getAuthBear(user_1));
    // logRes(a);
    let a = await server
      .post(`/api/users/search`)
      .set(getAuthBear(user_1))
      .send({ q: st });
    logRes(a);
  });
});
