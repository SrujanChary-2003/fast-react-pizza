import { useLoaderData, useNavigate } from 'react-router-dom';
import { getMenu } from '../../services/apiRestaurant';
import MenuItem from './MenuItem';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

function Menu() {
  const menu = useLoaderData();
  //console.log(menu);
  const username = useSelector((state) => state.user.userName);
  //console.log(username);
  const navigate = useNavigate();
  useEffect(
    function () {
      if (!username) navigate('/');
    },
    [username, navigate],
  );
  return (
    <ul className="divide-y divide-stone-200 px-3">
      {menu.map((pizza) => (
        <MenuItem pizza={pizza} key={pizza.id} />
      ))}
    </ul>
  );
}
export async function Loader() {
  const menu = await getMenu();
  return menu;
}
export default Menu;
