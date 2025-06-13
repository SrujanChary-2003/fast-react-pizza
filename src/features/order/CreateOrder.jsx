import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import Button from '../../ui/Button';
import { createOrder, getMenu } from '../../services/apiRestaurant';
import store from '../../store';
import { clearCart, getTotalCartPrice } from '../cart/cartSlice';
import EmptyCart from '../cart/EmptyCart';
import { useDispatch, useSelector } from 'react-redux';
import { getCart } from '../cart/cartSlice';
import { formatCurrency } from '../../utilities/helpers';
import { useState } from 'react';
import { fetchAddress } from '../user/userSlice';
// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

// const fakeCart = [
//   {
//     pizzaId: 12,
//     name: 'Mediterranean',
//     quantity: 2,
//     unitPrice: 16,
//     totalPrice: 32,
//   },
//   {
//     pizzaId: 6,
//     name: 'Vegetale',
//     quantity: 1,
//     unitPrice: 13,
//     totalPrice: 13,
//   },
//   {
//     pizzaId: 11,
//     name: 'Spinach and Mushroom',
//     quantity: 1,
//     unitPrice: 15,
//     totalPrice: 15,
//   },
// ];

function CreateOrder() {
  const {
    userName: username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);
  //console.log(position, addressStatus);
  //console.log(username, address)
  const isLoadingAddress = addressStatus === 'loading';
  //console.log(isLoadingAddress);

  //const address = useSelector((state) => state.user.address);
  const [withPriority, setWithPriority] = useState(false);
  //const cart = fakeCart;
  const navigate = useNavigation();
  const isSubmitting = navigate.state === 'submitting';
  const formErrors = useActionData();
  const dispatch = useDispatch();
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;
  //console.log(cart);
  if (!cart.length) return <EmptyCart />;
  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">
        Ready to order? Let&apos;s go!
      </h2>
      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow border-stone-300 bg-white"
            type="text"
            name="customer"
            required
            defaultValue={username}
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input
              className="input w-full border-stone-300 bg-white"
              type="tel"
              name="phone"
              required
            />
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full border-stone-300 bg-white"
              type="text"
              name="address"
              required
              defaultValue={address}
              disabled={isLoadingAddress}
            />
            {addressStatus === 'error' && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {errorAddress}
              </p>
            )}
          </div>
          {!position.latitude && !position.longitude && (
            <span className="absolute top-[4px] right-[3px] z-50 sm:top-[0px] sm:right-[0px] sm:text-[5px] md:top-[5px] md:right-[5px]">
              <Button
                disabled={isLoadingAddress}
                type="small"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                Get position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-4">
          <input
            className="h-6 w-6 accent-yellow-400 focus:ring focus:ring-yellow-400 focus:ring-offset-2 focus:outline-none"
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to you give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input
            type="hidden"
            name="position"
            value={
              position.latitude && position.longitude
                ? `Position: ${position.latitude},${position.longitude}`
                : ''
            }
          />
          <Button disabled={isSubmitting || isLoadingAddress} type="primary">
            {isSubmitting
              ? 'Placing Order...'
              : `Order now from ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}
// The below function has an error
// export async function action({ request }) {
//   const formData = await request.formData();
//   const data = Object.fromEntries(formData);
//   console.log(data);
//   const order = {
//     ...data,
//     cart: JSON.parse(data.cart),
//     priority: data.priority === 'on',
//   };
//   const errors = {};
//   if (!isValidPhone(order.phone)) {
//     errors.phone =
//       'Please enter correct mobile number. We might need to contact you...';
//   }
//   if (Object.keys(errors).length > 0) {
//     return errors;
//   }
//   console.log(order);
//   const newOrder = await createOrder(order);
//   return redirect(`/order/${newOrder.id}`);
// }

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Parse cart and priority
  let cart = JSON.parse(data.cart);
  const priority = data.priority === 'true';

  // ✅ Fetch menu to enrich cart with pizza name and unitPrice
  const menu = await getMenu();

  cart = cart.map((item) => {
    const pizza = menu.find((p) => p.id === item.pizzaId);
    return {
      ...item,
      name: pizza?.name || '',
      unitPrice: pizza?.unitPrice || 0,
    };
  });

  // Construct order
  const order = {
    customer: data.customer,
    phone: data.phone,
    address: data.address,
    priority,
    cart,
    position: data.position,
  };
  //console.log(order);

  // 🔍 Validate phone number
  const errors = {};
  if (!isValidPhone(order.phone)) {
    errors.phone =
      'Please enter correct mobile number. We might need to contact you...';
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  // ✅ Create the order
  const newOrder = await createOrder(order);

  // ✅ Clear cart from Redux
  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`);
  //return null;
}

export default CreateOrder;
