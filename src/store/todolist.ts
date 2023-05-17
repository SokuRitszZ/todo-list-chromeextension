import { createEffect, createSignal } from 'solid-js';

export type ITodoItem = {
  title: string;
  done: boolean;
  show: boolean;
  star: boolean;
  children?: ITodoItem[];
};

function newTodo(title: string): ITodoItem {
  return {
    title,
    done: false,
    show: true,
    star: false,
  };
}

const [todoList, setTodoList] = createSignal<ITodoItem[]>(
  JSON.parse(localStorage.getItem('todo-list') || '[]')
);

const [onlyShowStar, setOnlyShowStar] = createSignal(false);

export function toggleShowStar() {
  setOnlyShowStar(!onlyShowStar());
}

export { todoList, onlyShowStar };

createEffect(() => {
  localStorage.setItem('todo-list', JSON.stringify(todoList()));
});

export function addTodo(todo: ITodoItem | undefined, title: string) {
  if (!todo) {
    todoList().push(newTodo(title));
  } else {
    (todo.children || (todo.children = [])).push(newTodo(title));
  }

  setTodoList([...todoList()]);
}

const parentMap = new Map<ITodoItem, ITodoItem>();

createEffect(() => {
  parentMap.clear();

  todoList().forEach((c) => dfs(c));

  function dfs(todo: ITodoItem) {
    const { children } = todo;
    children &&
      children.forEach((c) => {
        parentMap.set(c, todo);
        dfs(c);
      });
  }
});

export function toggleDone(todo: ITodoItem) {
  todo.done = !todo.done;
  down(todo);
  bubble(todo);

  setTodoList([...todoList()]);
}

function down(todo: ITodoItem) {
  const { children, done } = todo;

  children &&
    children.forEach((c) => {
      c.done = done;
      down(c);
    });
}

function bubble(todo: ITodoItem) {
  if (!parentMap.has(todo)) {
    return;
  }

  const p = parentMap.get(todo)!;
  if (p.done !== todo.done) {
    if (todo.done) {
      p.done = !p.children!.some((c) => !c.done);
    } else {
      p.done = false;
    }
    bubble(p);
  }
}

export function resetTodoTitle(item: ITodoItem, title: string) {
  item.title = title;

  setTodoList([...todoList()]);
}

export function clearDoneTodo() {
  setTodoList(dfs(todoList()));

  function dfs(todoList: ITodoItem[]) {
    const res = todoList.filter((t) => !t.done);

    res.forEach((t) => t.children && (t.children = dfs(t.children)));

    return res;
  }
}

export function toggleShow(item: ITodoItem) {
  item.show = !item.show;

  setTodoList([...todoList()]);
}

export function toggleStar(item: ITodoItem) {
  item.star = !item.star;

  setTodoList([...todoList()]);
}

export function deleteTodo(item: ITodoItem) {
  const p = parentMap.get(item)!;
  p.children?.splice(p.children.indexOf(item));

  setTodoList([...todoList()]);
}
