let cartMap;
let size = 0;
let totalPrice = 0;
window.onload = function() {
    let user = localStorage.getItem("username");
    if (user === null) {
        window.location.href = '/';
    }

    getProducts();

    let p = document.createElement('p');
    p.textContent = `Welcome, ${user}`;
    document.getElementById('welcomeUser').appendChild(p);

    document.getElementById('logout').onclick = function(event) {
        event.preventDefault();
        logout();
    }

    cartMap = new Map();
}

async function getProducts() {
    let token = localStorage.getItem('token');
    if (token !== null) {
        let products = await fetch('http://localhost:3000/products/', {
            headers: {
                'Content-type': 'application/json',
                'authorization': token
            },
        }).then(response => response.json());
        products.forEach(prod => {
            if (prod.stock > 0) {
                renderTableRow(prod)
            }
        });
    }
}
async function logout() {
    localStorage.clear();
    cartMap.clear();
    size = 0;
    totalPrice = 0;
    window.location.href = '/';
}

function renderTableRow(prod) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = prod.name;

    const tdPrice = document.createElement('td');
    tdPrice.textContent = prod.price;

    const tdImage = document.createElement('td');
    const image = document.createElement('img');
    image.src = `/images/${prod.image}`;
    image.height = 30;
    tdImage.appendChild(image);

    const tdStock = document.createElement('td');
    tdStock.textContent = prod.stock;

    const tdAction = document.createElement('td');
    const iCart = document.createElement('img');
    iCart.src = '/images/cart-plus.svg';
    iCart.height = 30;
    iCart.onclick = function () {
        console.log(cartMap.get(prod.id));
        if (cartMap.get(prod.id) !== undefined) {
            let product = cartMap.get(prod.id);
            if (product.quantity < prod.stock) {
                product.quantity++;
                size++;
                totalPrice += product.price;
            }
        } else {
            prod.quantity = 1;
            cartMap.set(prod.id, prod);
            size++;
            totalPrice += prod.price;
        }
        renderShoppingCart();

    };
    tdAction.appendChild(iCart);

    tr.appendChild(tdName);
    tr.appendChild(tdPrice);
    tr.appendChild(tdImage);
    tr.appendChild(tdStock);
    tr.appendChild(tdAction);

    const tBody = document.getElementById('tableBody');
    tBody.appendChild(tr);
}

function renderShoppingCart() {
    const cart = document.getElementById('shoppingCart');
    if (size === 0) {
        const h4 = document.createElement('h4');
        h4.className = 'm-4';
        h4.textContent = 'There is no item in your shopping cart!';
        cart.replaceChildren();
        cart.appendChild(h4);
    } else {
        const table = document.createElement("table");
        table.classList.add("table", "table-bordered", "table-striped");

        const thead = document.createElement("thead");
        const theadRow = document.createElement("tr");
        theadRow.innerHTML = `
            <th scope="col">Name</th>
            <th scope="col">Price</th>
            <th scope="col">Total</th>
            <th scope="col">Quantity</th>`;
        thead.appendChild(theadRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        cartMap.forEach((value, key) => {
            const row = createShoppingCartItem(value);
            tbody.appendChild(row);
        })
        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `
        <td colspan="4">
                <p class="place-btn-layout">Total Price: ${totalPrice.toFixed(2)}</p>
        </td>`;
        tbody.appendChild(totalRow);
        tbody.appendChild(totalRow);
        table.appendChild(tbody);
        cart.replaceChildren();
        cart.appendChild(table);

        const placeLayout = document.createElement("div");
        placeLayout.className = "place-btn-layout";

        const placeButton = document.createElement("button");
        placeButton.className = "btn btn-primary";
        placeButton.textContent = "Place Order";
        placeButton.onclick = function () {
            let checkPlaceStatus = true;
            cartMap.forEach((value, key) => {
                if (value.quantity === value.stock) {
                    value.stock = 0;
                    deleteProduct(value).then((result) => {
                        if (result !== true) {
                            checkPlaceStatus = false;
                        }
                    });
                } else {
                    value.stock = value.stock - value.quantity;
                    update(value).then((result) => {
                        if (result !== true) {
                            checkPlaceStatus = false;
                        }
                    });
                }
            });

            if (checkPlaceStatus) {
                alert("Place Successfully");
            } else {
                alert("Place Failed")
            }
            location.reload();
        }

        placeLayout.appendChild(placeButton);

        cart.appendChild(placeLayout);
    }
}
function createShoppingCartItem(item) {
    const row = document.createElement("tr");

    const createCell = (content, className = "") => {
        const cell = document.createElement("td");
        cell.textContent = content;
        if (className) {
            cell.className = className;
        }
        return cell;
    };

    const nameCell = createCell(item.name, "cartCell");
    const priceCell = createCell(item.price.toFixed(2), "cartCell");
    const totalCell = createCell((item.price * item.quantity).toFixed(2), "cartCell");

    const minusButton = document.createElement("button");
    minusButton.className = "btn btn-sm btn-secondary controlButton";
    minusButton.textContent = '-';
    minusButton.onclick = () => {
        if (item.quantity > 0) {
            item.quantity--;
            size--;
            totalPrice -= item.price;
            cartMap.set(item.id, item);
            if (item.quantity === 0) {
                cartMap.delete(item.id);
            }
            renderShoppingCart();
        }
    };

    const inputQuantity = createCell("", "cartQuantityCell");
    const inputElement = document.createElement("input");
    inputElement.type = "number";
    inputElement.className = "m-1 inputQuantity";
    inputElement.readOnly = true;
    inputElement.min = "0";
    inputElement.max = item.max;
    inputElement.value = item.quantity;
    inputQuantity.appendChild(inputElement);

    const plusButton = document.createElement("button");
    plusButton.className = "btn btn-sm btn-secondary controlButton";
    plusButton.textContent = '+';
    plusButton.onclick = () => {
        if (item.quantity < item.stock) {
            item.quantity++;
            totalPrice += item.price;
            size++;
            cartMap.set(item.id, item);
            renderShoppingCart();
        }
    };

    inputQuantity.appendChild(minusButton);
    inputQuantity.appendChild(inputElement);
    inputQuantity.appendChild(plusButton);

    row.appendChild(nameCell);
    row.appendChild(priceCell);
    row.appendChild(totalCell);
    row.appendChild(inputQuantity);

    return row;
}

async function update(prod) {
    let token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/products/${prod.id}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'authorization': token
            },
            body: JSON.stringify({
                name: prod.name,
                price: prod.price,
                image: prod.image,
                stock: prod.stock,
            })
        });

        if (response.ok) {
            console.log('success');
            return true;
        } else {
            // Handle non-OK response (e.g., server error)
            console.error('Error');
            return false;
        }
    } catch (error) {
        // Handle network errors or other exceptions
        console.error('An error occurred:', error);
        return false;
    }
}

async function deleteProduct(prod) {
    let token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/products/${prod.id}`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'authorization': token
            },
        });

        if (response.ok) {
            console.log('Product deleted successfully');
            return true; // Return true if deletion is successful
        } else {
            console.error('Failed to delete product');
            return false; // Return false if deletion fails
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return false; // Return false in case of network errors or exceptions
    }
}
