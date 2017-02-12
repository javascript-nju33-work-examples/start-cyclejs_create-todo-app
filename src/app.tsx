import xs, {Stream} from 'xstream';
import {VNode} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {Sources, Sinks} from './interfaces';

function TodoItem(sources : Sources) : Sinks {
  // sources.props.item$.map(prop => {
  //   console.log(prop)
  // });
  // sources.props.item$.map(item => {
  //   console.log(item)
  // });

  // const vdom$ = sources.props.item$.map(item => {
  //   return (
  //     <li>
  //       {item.content}
  //     </li>
  //   );
  // });
  console.log(sources.DOM)
  const a : Stream<VNode> = xs.of(
    <div>124</div>
  )

  return {
    DOM: a,
    value: 'aa'
  };
}

function TodoList(sources : Sources) : Sinks {
  const todoitems$ = sources.props.items$.map(items => {
    if (!items) {
      return null;
    }

    return items.map((item, i) => {
      console.log(item)
      return isolate(TodoItem, i)({
        DOM: sources.DOM,
        props: {
          item$: xs.of(item)
        }
      });
    });
  });

  return {
    DOM: todoitems$.map(todoitems => {
      if (!todoitems) {
        return <div>Nothing</div>;
      }

      todoitems = todoitems.map(i => i.DOM);

      // return (<ul>{xs.fromArray(todoitems.map(c => c.DOM)).map(function(a) {
      const items = xs.fromArray(todoitems).map(item => {
        return (
          item
        )
      });
      return <ul>{items}</ul>;
      // return <div>alkdjf</div>;
      return (<ul>{todoitems[0].DOM.map(function(a) {
        console.log(a);
        return 'hoge';
      })}</ul>);
    })
  };
}

export function App(sources : Sources) : Sinks {
  const req$ = xs.of({
    url: 'http://localhost:3000/todos', // GET method by default
    category: 'todo',
  });

  // const res$ = sources.HTTP.select('todo');
  const todolist$ = sources.HTTP.select('todo').flatten().startWith([]);

  const todoList = isolate(TodoList)({
    DOM: sources.DOM,
    props: {
      items$: todolist$.map(res => res.body)
    }
  });

  const todoitem = isolate(TodoItem)({
    DOM: sources.DOM,
    props: {
      item$: xs.of({content: 'aiueo'})
    }
  });

  const vdom$ : Stream<VNode> = xs.combine(todoList.DOM, todoitem.DOM).map(([todolist, todoitem]) => {
    console.log(todolist);
    console.log(todoitem);
    return (
      <section>
        <h1>Todo</h1>
        {todolist}
        {todoitem}
      </section>
    );
  });

  return {
    DOM: vdom$,
    HTTP: req$
  };
}
