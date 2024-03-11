(() => {
    let toDoListArray = [];
    const form = document.querySelector(".form");
    const input = form.querySelector(".form__input");
    const ul = document.querySelector(".toDoList");

    const removeItem = async (id, title) => {
      removeItemFromDOM(id);
  
      
      removeItemFromArray(id);
  
      try {
        
        const response = await fetch(`/deleteTodo/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete todo');
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    };
  
    // Fetch outdated todos when the page loads
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const response = await fetch('/getOutdatedTodos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch outdated todos');
        }
  
        const { outdatedTodos } = await response.json();
        if (outdatedTodos && outdatedTodos.length > 0) {
          
          outdatedTodos.forEach(todo => {
            removeItem(todo._id, todo.title);
          });
        }
      } catch (error) {
        console.error('Error fetching outdated todos:', error);
      }
    });
  
    
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const response = await fetch('/getUserData', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        const { todos } = await response.json();
        if (todos && todos.length > 0) {
          
          todos.forEach(todo => {
            addItemToDOM(todo._id, todo.title);
            addItemToArray(todo._id, todo.title);
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    });
  
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let itemId = String(Date.now());
      let toDoItem = input.value;
      addItemToDOM(itemId, toDoItem);
      addItemToArray(itemId, toDoItem);
  
      
      try {
        const response = await fetch('/addTodo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: toDoItem }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to add todo');
        }
      } catch (error) {
        console.error('Error adding todo:', error);
      }
  
      input.value = '';
    });
  
    ul.addEventListener('click', e => {
      let id = e.target.getAttribute('data-id');
      if (!id) return;
      removeItem(id, e.target.innerText);
    });
  
    function addItemToDOM(itemId, toDoItem) {
      const li = document.createElement('li');
      li.setAttribute("data-id", itemId);
      li.innerText = toDoItem;
      ul.appendChild(li);
    }
  
    function addItemToArray(itemId, toDoItem) {
      toDoListArray.push({ itemId, toDoItem });
      console.log('Added:', toDoListArray);
    }
  
    function removeItemFromArray(id) {
      toDoListArray = toDoListArray.filter(item => item.itemId !== id);
      console.log('Removed:', toDoListArray);
    }
  
    function removeItemFromDOM(id) {
      var li = document.querySelector('[data-id="' + id + '"]');
      ul.removeChild(li);
    }
  })();
  


















