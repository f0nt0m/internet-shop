document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("product-list");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const categoryFilter = document.getElementById("category");
    const sortFilter = document.getElementById("sort");
    const searchInput = document.getElementById("search");

    let products = [];
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let currentPage = 1;
    const itemsPerPage = 4;

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function createCartItem(item) {
        const cartItem = document.createElement("div");
        cartItem.className = "flex justify-between p-2 border-b";

        const nameQuantitySpan = document.createElement("span");
        nameQuantitySpan.textContent = `${item.name} (${item.quantity} шт.)`;

        const priceSpan = document.createElement("span");
        priceSpan.textContent = `${item.price * item.quantity} руб.`;

        const removeButton = document.createElement("button");
        removeButton.className = "bg-red-500 text-white px-2 py-1 rounded remove-item";
        removeButton.textContent = "Удалить";
        removeButton.dataset.id = item.id;

        cartItem.appendChild(nameQuantitySpan);
        cartItem.appendChild(priceSpan);
        cartItem.appendChild(removeButton);

        return cartItem;
    }

    function updateCartUI() {
        cartItemsContainer.textContent = "";
        let total = 0;

        cart.forEach(item => {
            const cartItem = createCartItem(item);
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        cartTotalElement.textContent = total;
        saveCart();
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    }

    function createProductCard(product) {
        const productCard = document.createElement("div");
        productCard.className = "bg-white p-4 rounded-lg shadow-md";

        const img = document.createElement("img");
        img.src = product.image;
        img.alt = product.name;
        img.className = "w-full h-40 object-cover mb-4 rounded";

        const title = document.createElement("h3");
        title.className = "text-lg font-bold";
        title.textContent = product.name;

        const price = document.createElement("p");
        price.className = "text-gray-600";
        price.textContent = `${product.price} руб.`;

        const addButton = document.createElement("button");
        addButton.className = "bg-blue-500 text-white px-4 py-2 mt-2 rounded add-to-cart";
        addButton.textContent = "Добавить в корзину";
        addButton.dataset.id = product.id;
        addButton.addEventListener("click", () => {
            const productToAdd = products.find(p => p.id === product.id);
            if (productToAdd) addToCart(productToAdd);
        });

        productCard.appendChild(img);
        productCard.appendChild(title);
        productCard.appendChild(price);
        productCard.appendChild(addButton);

        return productCard;
    }

    function createPaginationButton(pageNum, isCurrentPage) {
        const button = document.createElement("button");
        button.className = `px-4 py-2 rounded ${isCurrentPage ? "bg-blue-500 text-white" : "bg-gray-200"}`;
        button.textContent = pageNum;
        button.addEventListener("click", () => {
            currentPage = pageNum;
            renderProducts();
        });
        return button;
    }

    function renderProducts() {
        productList.textContent = "";
        let filteredProducts = [...products];

        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== "all") {
            filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }

        const searchQuery = searchInput.value.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery)
        );

        const sortOption = sortFilter.value;
        if (sortOption === "price-asc") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortOption === "price-desc") {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortOption === "name-asc") {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === "name-desc") {
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

        const fragment = document.createDocumentFragment();
        paginatedProducts.forEach(product => {
            const productCard = createProductCard(product);
            fragment.appendChild(productCard);
        });

        productList.appendChild(fragment);
        renderPagination(filteredProducts.length);
    }

    function renderPagination(totalItems) {
        const paginationContainer = document.getElementById("pagination");
        paginationContainer.textContent = "";

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = createPaginationButton(i, i === currentPage);
            fragment.appendChild(pageButton);
        }

        paginationContainer.appendChild(fragment);
    }

    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            products = data;
            renderProducts();
        })
        .catch(error => {
            console.error("Error loading products:", error);
            const errorMsg = document.createElement("p");
            errorMsg.className = "text-red-500 text-center";
            errorMsg.textContent = "Ошибка загрузки товаров";
            productList.appendChild(errorMsg);
        });

    cartItemsContainer.addEventListener("click", function (event) {
        const removeButton = event.target.closest(".remove-item");
        if (removeButton) {
            const productId = parseInt(removeButton.dataset.id);
            removeFromCart(productId);
        }
    });

    categoryFilter.addEventListener("change", renderProducts);
    sortFilter.addEventListener("change", renderProducts);
    searchInput.addEventListener("input", renderProducts);

    updateCartUI();
});