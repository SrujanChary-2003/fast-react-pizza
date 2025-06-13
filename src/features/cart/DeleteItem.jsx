import { useDispatch } from 'react-redux';
import Button from '../../ui/Button';
import { deleteItem } from './cartSlice';
import propTypes from 'prop-types';
function DeleteItem({ pizzaId }) {
  const dispatch = useDispatch();
  return (
    <Button onClick={() => dispatch(deleteItem(pizzaId))} type="small">
      Delete
    </Button>
  );
}

// DeleteItem.propTypes = {
//   id: propTypes.shape({
//     id: propTypes.number.isRequired,
//   }),
// };

export default DeleteItem;
