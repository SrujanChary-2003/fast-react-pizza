async function getdata() {
  const data = await fetch(
    'https://react-fast-pizza-api.jonas.io/api/order/new',
  );
  const res = await data.json();
  console.log(data);
  console.log(res);
}

getdata();
