import {
  ITodoItem,
  addTodo,
  clearDoneTodo,
  deleteTodo,
  onlyShowStar,
  resetTodoTitle,
  todoList,
  toggleDone,
  toggleShow,
  toggleShowStar,
  toggleStar,
} from '@root/store/todolist';
import { createSignal } from 'solid-js';
import style from './todolist.module.css';

const [todoTitle, setTodoTitle] = createSignal('');

export function TodoList() {
  return (
    <div class={'font-mono flex flex-col items-center ' + style}>
      <h1 class='text-4xl font-serif'>TodoList</h1>
      <div class='w-full flex items-center gap-3'>
        <input
          class='flex-grow h-full'
          onChange={(e) => setTodoTitle(e.currentTarget.value)}
          value={todoTitle()}
          onKeyUp={(e) => {
            e.key === 'Enter' && toAddTodo(undefined);
          }}
          type='text'
        />
        <button class='flex-none' onClick={toClearTodo}>
          清除
        </button>
        <button
          style={{
            'background-color': onlyShowStar() ? '#800' : '#ccc',
            color: onlyShowStar() ? '#ddd' : 'inherit',
          }}
          class='flex-none'
          onClick={toggleShowStar}
        >
          特殊
        </button>
      </div>
      <div class='w-full max-h-[20rem] overflow-auto mt-2'>
        {todoList().map((c, i) => (
          <TodoListItem item={c} prefix='' index={i} />
        ))}
      </div>
    </div>
  );
}

const colors = ['fed', 'edc', 'dcb', 'cba', 'ba9'];

function TodoListItem(props: {
  item: ITodoItem;
  prefix: string;
  index: number;
}) {
  const { item, prefix, index } = props;
  const { children } = item;
  const id = `todo-${prefix}${index}`;
  const color = `#${colors[(prefix.length >> 1) % colors.length]}`;

  return (
    <>
      {((onlyShowStar() && item.star) || !onlyShowStar()) && (
        <div
          class='w-full h-5 flex items-center gap-3 pl-2 pr-3 box-border'
          style={{
            'background-color': color,
            color: item.star ? '#a00' : '#222',
          }}
        >
          <a onClick={() => toToggleStar(item)} href='javascript:'>
            {item.star ? '$' : '*'}
          </a>
          <input
            class='hidden'
            id={id}
            onChange={() => toToggleDone(item)}
            checked={item.done}
            type='checkbox'
          />
          <label for={id} class='w-[12rem] overflow-hidden whitespace-nowrap'>
            {prefix + index}-{item.title}
          </label>
          <a onClick={() => toAddTodo(item)} href='javascript:'>
            +
          </a>
          <a onClick={() => toResetTodoTitle(item)} href='javascript:'>
            #
          </a>
          {(children && children.length && (
            <a onClick={() => toToggleShow(item)} href='javascript:'>
              {item.show ? '~' : '@'}
            </a>
          )) || (
            <a
              href='javascript:'
              onMouseDown={() => startToDelete(item)}
              onMouseUp={cancelDeleting}
            >
              -
            </a>
          )}
        </div>
      )}
      {(item.show || onlyShowStar()) &&
        children &&
        children.map((c, i) => (
          <TodoListItem prefix={`${prefix}${index}.`} index={i} item={c} />
        ))}
    </>
  );
}

function toAddTodo(todo?: ITodoItem) {
  if (!todoTitle()) return;

  addTodo(todo, todoTitle());
  setTodoTitle('');
}

function toClearTodo() {
  clearDoneTodo();
}

function toToggleDone(item: ITodoItem) {
  toggleDone(item);
}

function toResetTodoTitle(item: ITodoItem) {
  if (!todoTitle()) {
    return;
  }

  resetTodoTitle(item, todoTitle());
  setTodoTitle('');
}

function toToggleShow(item: ITodoItem) {
  toggleShow(item);
}

function toToggleStar(item: ITodoItem) {
  toggleStar(item);
}

let timer: NodeJS.Timer;
function startToDelete(item: ITodoItem) {
  timer = setTimeout(() => {
    deleteTodo(item);
  }, 1000);
}

function cancelDeleting() {
  clearTimeout(timer);
}
