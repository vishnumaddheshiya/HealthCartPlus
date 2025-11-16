// Global State
const state = {
    currentUser: null,
    cart: [],
    wishlist: [],
    products: [],
    orders: [],
    users: [],
    prescriptions: [],
    addresses: [],
    appointments: []
};

// Storage Service
const storage = {
    // Users
    saveUsers(users) {
        localStorage.setItem('mediswift_users', JSON.stringify(users));
    },
    getUsers() {
        return JSON.parse(localStorage.getItem('mediswift_users') || '[]');
    },
    saveCurrentUser(user) {
        localStorage.setItem('mediswift_currentUser', JSON.stringify(user));
    },
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('mediswift_currentUser') || 'null');
    },
    logoutUser() {
        localStorage.removeItem('mediswift_currentUser');
    },

    // Cart
    saveCart(cart) {
        localStorage.setItem('mediswift_cart', JSON.stringify(cart));
    },
    getCart() {
        return JSON.parse(localStorage.getItem('mediswift_cart') || '[]');
    },

    // Wishlist
    saveWishlist(wishlist) {
        localStorage.setItem('mediswift_wishlist', JSON.stringify(wishlist));
    },
    getWishlist() {
        return JSON.parse(localStorage.getItem('mediswift_wishlist') || '[]');
    },

    // Products
    saveProducts(products) {
        localStorage.setItem('mediswift_products', JSON.stringify(products));
    },
    getProducts() {
        return JSON.parse(localStorage.getItem('mediswift_products') || '[]');
    },

    // Orders
    saveOrders(orders) {
        localStorage.setItem('mediswift_orders', JSON.stringify(orders));
    },
    getOrders() {
        return JSON.parse(localStorage.getItem('mediswift_orders') || '[]');
    },

    // Prescriptions
    savePrescriptions(prescriptions) {
        localStorage.setItem('mediswift_prescriptions', JSON.stringify(prescriptions));
    },
    getPrescriptions() {
        return JSON.parse(localStorage.getItem('mediswift_prescriptions') || '[]');
    },

    // Addresses
    saveAddresses(addresses) {
        localStorage.setItem('mediswift_addresses', JSON.stringify(addresses));
    },
    getAddresses() {
        return JSON.parse(localStorage.getItem('mediswift_addresses') || '[]');
    },

    // Appointments
    saveAppointments(appointments) {
        localStorage.setItem('mediswift_appointments', JSON.stringify(appointments));
    },
    getAppointments() {
        return JSON.parse(localStorage.getItem('mediswift_appointments') || '[]');
    }
};

// Mock API
const api = {
    getProducts() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(state.products);
            }, 300);
        });
    },

    login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = state.users.find(
                    (u) =>
                        (u.email === email || u.phone === email) &&
                        u.password === password
                );
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('Invalid email/phone or password'));
                }
            }, 500);
        });
    },

    register(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const existingUser = state.users.find(
                    (u) => u.email === userData.email || u.phone === userData.phone
                );
                if (existingUser) {
                    reject(
                        new Error('User with this email or phone already exists')
                    );
                } else {
                    const newUser = {
                        id: Date.now().toString(),
                        ...userData,
                        walletBalance: 500,
                        joinedDate: new Date().toISOString()
                    };
                    state.users.push(newUser);
                    storage.saveUsers(state.users);
                    resolve(newUser);
                }
            }, 500);
        });
    },

    placeOrder(orderData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const order = {
                    id: 'ORD' + Date.now(),
                    date: new Date().toISOString(),
                    status: 'CONFIRMED',
                    deliveryEstimate: '2-3 business days',
                    ...orderData
                };
                state.orders.push(order);
                storage.saveOrders(state.orders);
                resolve(order);
            }, 1000);
        });
    },

    // Simulate OTP sending
    sendOTP(phone) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('123456'); // Demo OTP
            }, 1000);
        });
    }
};

// Router
const router = {
    currentRoute: '',
    routes: {
        '/': 'home',
        '/login': 'login',
        '/products': 'products',
        '/product/:id': 'product-detail',
        '/cart': 'cart',
        '/checkout': 'checkout',
        '/order-confirmation/:orderId': 'order-confirmation',
        '/order-tracking': 'order-tracking',          // generic tracking view
        '/order-tracking/:orderId': 'order-tracking', // tracking specific order
        '/prescription': 'prescription',
        '/profile': 'profile',
        '/support': 'support',
        '/telemedicine': 'telemedicine',
        '/admin': 'admin',
        '/wishlist': 'wishlist',
        '/wallet': 'wallet',
        '/refill-reminders': 'refill-reminders'
    },

    init() {
        window.addEventListener(
            'hashchange',
            this.handleRouteChange.bind(this)
        );
        this.handleRouteChange();

        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        window.location.hash =
                            `/products?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    },

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || '/';
        this.navigate(hash);
    },

    navigate(path) {
        const protectedRoutes = ['/checkout', '/profile', '/wallet', '/refill-reminders'];
        if (protectedRoutes.includes(path.split('?')[0]) && !state.currentUser) {
            this.showToast('Please login to continue', 'error');
            window.location.hash = '/login';
            return;
        }

        let viewName = '';
        let params = {};
        let query = {};

        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
            const queryString = path.substring(queryIndex + 1);
            path = path.substring(0, queryIndex);

            queryString.split('&').forEach((pair) => {
                const [key, value] = pair.split('=');
                query[key] = decodeURIComponent(value || '');
            });
        }

        for (const route in this.routes) {
            const routePattern = route.replace(/:\w+/g, '([^/]+)');
            const match = path.match(new RegExp(`^${routePattern}$`));

            if (match) {
                viewName = this.routes[route];
                const paramNames = (route.match(/:\w+/g) || []).map((name) =>
                    name.substring(1)
                );
                paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                break;
            }
        }

        if (!viewName) {
            viewName = 'home';
        }

        this.currentRoute = path;
        this.renderView(viewName, params, query);
        this.updateNavigation();
    },

    renderView(viewName, params, query) {
        document.querySelectorAll('.view').forEach((view) => {
            view.classList.remove('active');
        });

        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.add('active');

            if (typeof views[viewName] === 'function') {
                views[viewName](params, query);
            }
        }
    },

    updateNavigation() {
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${this.currentRoute}`) {
                link.classList.add('active');
            }
        });

        const userMenuBtn = document.getElementById('user-menu-btn');
        if (state.currentUser) {
            userMenuBtn.innerHTML = `<i class="fas fa-user"></i> ${
                state.currentUser.name.split(' ')[0]
            }`;
            document.getElementById('logout-btn').style.display = 'block';
        } else {
            userMenuBtn.innerHTML = `<i class="fas fa-user"></i> Account`;
            document.getElementById('logout-btn').style.display = 'none';
        }
    },

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${
                type === 'success'
                    ? '✓'
                    : type === 'error'
                    ? '✕'
                    : type === 'warning'
                    ? '⚠'
                    : 'ℹ'
            }</div>
            <div>${message}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// Views
const views = {
    home() {
        const featuredContainer = document.getElementById('featured-products');
        if (featuredContainer) {
            featuredContainer.innerHTML = '';
            const featuredProducts = state.products.filter((p) => p.featured).slice(0, 6);
            featuredProducts.forEach((product) => {
                featuredContainer.appendChild(components.createProductCard(product));
            });
        }

        const discountContainer = document.getElementById('discount-products');
        if (discountContainer) {
            discountContainer.innerHTML = '';
            const discountProducts = state.products
                .filter((p) => p.discountPrice < p.mrp)
                .sort((a, b) => {
                    const discountA = 1 - a.discountPrice / a.mrp;
                    const discountB = 1 - b.discountPrice / b.mrp;
                    return discountB - discountA;
                })
                .slice(0, 6);
            discountProducts.forEach((product) => {
                discountContainer.appendChild(components.createProductCard(product));
            });
        }

        document.querySelectorAll('.category-card').forEach((card) => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                window.location.hash = `/products?category=${category}`;
            });
        });
    },

    login() {
        document.querySelectorAll('.auth-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                document
                    .querySelectorAll('.auth-tab')
                    .forEach((t) => t.classList.remove('active'));
                document
                    .querySelectorAll('.auth-form')
                    .forEach((f) => f.classList.remove('active'));

                tab.classList.add('active');
                document
                    .getElementById(`${tab.dataset.tab}-form`)
                    .classList.add('active');
            });
        });

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                try {
                    const user = await api.login(email, password);
                    state.currentUser = user;
                    storage.saveCurrentUser(user);
                    router.navigate('/');
                    router.showToast('Login successful!', 'success');
                } catch (error) {
                    router.showToast(error.message, 'error');
                }
            });
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('register-name').value;
                const age = document.getElementById('register-age').value;
                const phone = document.getElementById('register-phone').value;
                const email = document.getElementById('register-email').value;
                const address = document.getElementById('register-address').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById(
                    'register-confirm-password'
                ).value;

                if (password !== confirmPassword) {
                    router.showToast('Passwords do not match', 'error');
                    return;
                }

                const otpSection = document.getElementById('otp-section');
                if (otpSection) otpSection.style.display = 'block';

                const otp = await api.sendOTP(phone);
                router.showToast(`OTP sent to ${phone}`, 'info');

                const verifyBtn = document.getElementById('verify-otp');
                if (verifyBtn) {
                    const clickHandler = async () => {
                        const otpInputs = document.querySelectorAll('.otp-input');
                        const enteredOTP = Array.from(otpInputs)
                            .map((input) => input.value)
                            .join('');

                        if (enteredOTP === otp) {
                            try {
                                const user = await api.register({
                                    name,
                                    age,
                                    phone,
                                    email,
                                    address,
                                    password
                                });
                                state.currentUser = user;
                                storage.saveCurrentUser(user);
                                router.navigate('/');
                                router.showToast(
                                    'Registration successful!',
                                    'success'
                                );
                            } catch (error) {
                                router.showToast(error.message, 'error');
                            }
                        } else {
                            router.showToast(
                                'Invalid OTP. Please try again.',
                                'error'
                            );
                        }
                    };

                    verifyBtn.onclick = clickHandler;
                }
            });
        }

        const forgotPassword = document.getElementById('forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                router.showToast(
                    'Password reset link sent to your email',
                    'info'
                );
            });
        }
    },

    products(params, query) {
        const productsContainer = document.getElementById('products-list');
        if (!productsContainer) return;
        productsContainer.innerHTML = '';

        let filteredProducts = [...state.products];

        if (query.search) {
            const searchTerm = query.search.toLowerCase();
            filteredProducts = filteredProducts.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.brand.toLowerCase().includes(searchTerm) ||
                    product.saltComposition
                        .toLowerCase()
                        .includes(searchTerm)
            );
        }

        const categoryFilter = document.getElementById('filter-category');
        const prescriptionFilter = document.getElementById(
            'filter-prescription'
        );
        const sortSelect = document.getElementById('sort-products');

        if (query.category && categoryFilter) {
            categoryFilter.value = query.category;
            filteredProducts = filteredProducts.filter(
                (product) => product.type === query.category
            );
        }

        const renderFilteredProducts = () => {
            productsContainer.innerHTML = '';
            filteredProducts.forEach((product) => {
                productsContainer.appendChild(
                    components.createProductCard(product)
                );
            });
        };

        if (categoryFilter) {
            categoryFilter.onchange = () => {
                const category = categoryFilter.value;
                if (category) {
                    filteredProducts = state.products.filter(
                        (product) => product.type === category
                    );
                } else {
                    filteredProducts = [...state.products];
                }
                renderFilteredProducts();
            };
        }

        if (prescriptionFilter) {
            prescriptionFilter.onchange = () => {
                const prescription = prescriptionFilter.value;
                let base = [...state.products];

                if (categoryFilter && categoryFilter.value) {
                    base = base.filter(
                        (p) => p.type === categoryFilter.value
                    );
                }

                if (prescription === 'required') {
                    filteredProducts = base.filter(
                        (product) => product.requiresPrescription
                    );
                } else if (prescription === 'not-required') {
                    filteredProducts = base.filter(
                        (product) => !product.requiresPrescription
                    );
                } else {
                    filteredProducts = base;
                }
                renderFilteredProducts();
            };
        }

        if (sortSelect) {
            sortSelect.onchange = () => {
                const sortBy = sortSelect.value;
                switch (sortBy) {
                    case 'price-low':
                        filteredProducts.sort(
                            (a, b) => a.discountPrice - b.discountPrice
                        );
                        break;
                    case 'price-high':
                        filteredProducts.sort(
                            (a, b) => b.discountPrice - a.discountPrice
                        );
                        break;
                    case 'discount':
                        filteredProducts.sort((a, b) => {
                            const discountA = 1 - a.discountPrice / a.mrp;
                            const discountB = 1 - b.discountPrice / b.mrp;
                            return discountB - discountA;
                        });
                        break;
                    default:
                        filteredProducts.sort((a, b) =>
                            a.name.localeCompare(b.name)
                        );
                }
                renderFilteredProducts();
            };
        }

        renderFilteredProducts();
    },

    'product-detail'(params) {
        const productId = params.id;
        const product = state.products.find((p) => p.id === productId);
        const container = document.getElementById('product-detail');

        if (!container) return;

        if (!product) {
            container.innerHTML = '<p>Product not found</p>';
            return;
        }

        const isInWishlist = state.wishlist.some(
            (item) => item.id === product.id
        );

        container.innerHTML = `
            <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px;">
                    <div class="product-image" style="height: 300px;">
                        <i class="fas fa-pills" style="font-size: 60px;"></i>
                    </div>
                </div>
                <div style="flex: 2; min-width: 300px;">
                    <h2 class="section-title">${product.name}</h2>
                    <p style="color: var(--gray); margin-bottom: 15px;">${
                        product.brand
                    } • ${product.manufacturer}</p>
                    <div class="product-price" style="margin-bottom: 15px;">
                        <span class="current-price">₹${
                            product.discountPrice
                        }</span>
                        <span class="original-price">₹${product.mrp}</span>
                        <span class="discount">${Math.round(
                            (1 - product.discountPrice / product.mrp) * 100
                        )}% OFF</span>
                    </div>
                    ${
                        product.requiresPrescription
                            ? '<div class="prescription-tag"><i class="fas fa-prescription"></i> Prescription Required</div>'
                            : ''
                    }
                    <div class="product-meta">
                        <span><i class="fas fa-box"></i> In Stock: ${
                            product.stock
                        }</span>
                        <span><i class="fas fa-shield-alt"></i> 100% Genuine</span>
                    </div>
                    <div style="margin: 20px 0;">
                        <h3>Salt Composition</h3>
                        <p>${product.saltComposition}</p>
                    </div>
                    <div style="margin: 20px 0;">
                        <h3>Usage</h3>
                        <p>Take this medicine in the dose and duration as advised by your doctor.</p>
                    </div>
                    <div style="margin: 20px 0;">
                        <h3>Precautions</h3>
                        <p>Consult your doctor if you experience any side effects. Do not take if allergic to any ingredients.</p>
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center; margin-top: 30px;">
                        <div class="quantity-control">
                            <button class="quantity-btn" id="decrease-qty">-</button>
                            <span id="product-quantity" style="min-width: 30px; text-align: center;">1</span>
                            <button class="quantity-btn" id="increase-qty">+</button>
                        </div>
                        <button class="btn btn-primary" id="add-to-cart-detail">Add to Cart</button>
                        <button class="btn-wishlist ${
                            isInWishlist ? 'active' : ''
                        }" id="wishlist-btn">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        let quantity = 1;
        document
            .getElementById('decrease-qty')
            .addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    document.getElementById('product-quantity').textContent =
                        quantity;
                }
            });

        document
            .getElementById('increase-qty')
            .addEventListener('click', () => {
                quantity++;
                document.getElementById('product-quantity').textContent =
                    quantity;
            });

        document
            .getElementById('add-to-cart-detail')
            .addEventListener('click', () => {
                const existingItem = state.cart.find(
                    (item) => item.id === product.id
                );

                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    state.cart.push({
                        ...product,
                        quantity
                    });
                }

                storage.saveCart(state.cart);
                updateCartBadge();
                router.showToast('Product added to cart', 'success');
            });

        document
            .getElementById('wishlist-btn')
            .addEventListener('click', () => {
                const isInWishlist = state.wishlist.some(
                    (item) => item.id === product.id
                );

                if (isInWishlist) {
                    state.wishlist = state.wishlist.filter(
                        (item) => item.id !== product.id
                    );
                    document
                        .getElementById('wishlist-btn')
                        .classList.remove('active');
                    router.showToast('Removed from wishlist', 'info');
                } else {
                    state.wishlist.push(product);
                    document
                        .getElementById('wishlist-btn')
                        .classList.add('active');
                    router.showToast('Added to wishlist', 'success');
                }

                storage.saveWishlist(state.wishlist);
                updateWishlistBadge();
            });
    },

    cart() {
        const container = document.getElementById('cart-items');
        if (!container) return;
        container.innerHTML = '';

        if (state.cart.length === 0) {
            container.innerHTML =
                '<p style="text-align: center; padding: 40px;">Your cart is empty</p>';
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let hasPrescriptionItem = false;
        let subtotal = 0;

        state.cart.forEach((item) => {
            if (item.requiresPrescription) {
                hasPrescriptionItem = true;
            }

            const itemTotal = item.discountPrice * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <i class="fas fa-pills"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${
                        item.discountPrice
                    } per unit</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" data-action="decrease" data-id="${
                                item.id
                            }">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase" data-id="${
                                item.id
                            }">+</button>
                        </div>
                        <button class="btn btn-danger btn-sm" data-action="remove" data-id="${
                            item.id
                        }">Remove</button>
                    </div>
                </div>
                <div style="font-weight: 600;">₹${itemTotal}</div>
            `;

            container.appendChild(cartItem);
        });

        const warning = document.getElementById('prescription-warning');
        if (warning) {
            warning.style.display = hasPrescriptionItem ? 'block' : 'none';
        }

        const discount = subtotal * 0.1;
        const delivery = subtotal > 500 ? 0 : 40;
        const gst = (subtotal - discount) * 0.05;
        const total = subtotal - discount + delivery + gst;

        document.getElementById('cart-subtotal').textContent =
            `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-discount').textContent =
            `-₹${discount.toFixed(2)}`;
        document.getElementById('cart-delivery').textContent =
            delivery === 0 ? 'FREE' : `₹${delivery}`;
        document.getElementById('cart-gst').textContent =
            `₹${gst.toFixed(2)}`;
        document.getElementById('cart-total').textContent =
            `₹${total.toFixed(2)}`;

        document
            .querySelectorAll('[data-action="decrease"]')
            .forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const item = state.cart.find((i) => i.id === id);
                    if (!item) return;
                    if (item.quantity > 1) {
                        item.quantity--;
                    } else {
                        state.cart = state.cart.filter((i) => i.id !== id);
                    }
                    storage.saveCart(state.cart);
                    updateCartBadge();
                    views.cart();
                });
            });

        document
            .querySelectorAll('[data-action="increase"]')
            .forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const item = state.cart.find((i) => i.id === id);
                    if (!item) return;
                    item.quantity++;
                    storage.saveCart(state.cart);
                    updateCartBadge();
                    views.cart();
                });
            });

        document
            .querySelectorAll('[data-action="remove"]')
            .forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    state.cart = state.cart.filter((i) => i.id !== id);
                    storage.saveCart(state.cart);
                    updateCartBadge();
                    views.cart();
                });
            });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.onclick = () => {
                if (hasPrescriptionItem && state.prescriptions.length === 0) {
                    router.showToast(
                        'Please upload prescription for prescription items',
                        'warning'
                    );
                    return;
                }
                router.navigate('/checkout');
            };
        }
    },

    prescription() {
        const fileInput = document.getElementById('prescription-file');
        const preview = document.getElementById('file-preview');
        const form = document.getElementById('prescription-form');

        if (fileInput && preview) {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];

                if (file) {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            preview.innerHTML = `
                                <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid var(--light-gray); border-radius: var(--radius);">
                                    <img src="${ev.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius);">
                                    <div>
                                        <div style="font-weight: 500;">${file.name}</div>
                                        <div style="color: var(--gray); font-size: 14px;">${(
                                            file.size / 1024
                                        ).toFixed(2)} KB</div>
                                    </div>
                                </div>
                            `;
                        };
                        reader.readAsDataURL(file);
                    } else {
                        preview.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid var(--light-gray); border-radius: var(--radius);">
                                <div style="width: 60px; height: 60px; background-color: #f5f7fa; display: flex; align-items: center; justify-content: center; border-radius: var(--radius);">
                                    📄
                                </div>
                                <div>
                                    <div style="font-weight: 500;">${file.name}</div>
                                    <div style="color: var(--gray); font-size: 14px;">${(
                                        file.size / 1024
                                    ).toFixed(2)} KB</div>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    preview.innerHTML = '';
                }
            };
        }

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const file = fileInput.files[0];
                if (!file) {
                    router.showToast('Please select a file', 'error');
                    return;
                }

                const prescription = {
                    id: Date.now().toString(),
                    userId: state.currentUser ? state.currentUser.id : 'guest',
                    fileName: file.name,
                    fileSize: file.size,
                    uploadDate: new Date().toISOString(),
                    status: 'PENDING'
                };

                state.prescriptions.push(prescription);
                storage.savePrescriptions(state.prescriptions);

                router.showToast(
                    'Prescription uploaded successfully',
                    'success'
                );
                form.reset();
                preview.innerHTML = '';
            };
        }
    },

    checkout() {
        const addressContainer = document.getElementById('address-list');
        if (!addressContainer) return;
        addressContainer.innerHTML = '';

        if (state.addresses.length === 0 && state.currentUser) {
            state.addresses.push({
                id: '1',
                type: 'home',
                name: state.currentUser.name,
                phone: state.currentUser.phone,
                address: state.currentUser.address,
                pincode: '700016',
                city: 'Kolkata',
                state: 'West Bengal',
                isDefault: true
            });
            storage.saveAddresses(state.addresses);
        }

        state.addresses.forEach((address) => {
            const addressCard = document.createElement('div');
            addressCard.className = `address-card ${
                address.isDefault ? 'selected' : ''
            }`;
            addressCard.innerHTML = `
                <h4>${
                    address.type.charAt(0).toUpperCase() + address.type.slice(1)
                }</h4>
                <p>${address.name}</p>
                <p>${address.address}</p>
                <p>${address.city}, ${address.state} - ${address.pincode}</p>
                <p>Phone: ${address.phone}</p>
                <div class="address-actions">
                    <button class="btn btn-sm btn-outline">Edit</button>
                    ${
                        !address.isDefault
                            ? '<button class="btn btn-sm btn-danger">Delete</button>'
                            : ''
                    }
                </div>
            `;

            addressCard.addEventListener('click', () => {
                document
                    .querySelectorAll('.address-card')
                    .forEach((card) => card.classList.remove('selected'));
                addressCard.classList.add('selected');
                state.addresses.forEach((a) => (a.isDefault = false));
                address.isDefault = true;
                storage.saveAddresses(state.addresses);
            });

            addressContainer.appendChild(addressCard);
        });

        const itemsContainer = document.getElementById('checkout-items');
        if (!itemsContainer) return;
        itemsContainer.innerHTML = '';

        let subtotal = 0;
        state.cart.forEach((item) => {
            const itemTotal = item.discountPrice * item.quantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name} × ${
                item.quantity
            }</div>
                    <div class="cart-item-price">₹${
                        item.discountPrice
                    } per unit</div>
                </div>
                <div style="font-weight: 600;">₹${itemTotal}</div>
            `;

            itemsContainer.appendChild(itemElement);
        });

        const discount = subtotal * 0.1;
        const delivery = subtotal > 500 ? 0 : 40;
        const gst = (subtotal - discount) * 0.05;
        const total = subtotal - discount + delivery + gst;

        document.getElementById('checkout-subtotal').textContent =
            `₹${subtotal.toFixed(2)}`;
        document.getElementById('checkout-discount').textContent =
            `-₹${discount.toFixed(2)}`;
        document.getElementById('checkout-delivery').textContent =
            delivery === 0 ? 'FREE' : `₹${delivery}`;
        document.getElementById('checkout-gst').textContent =
            `₹${gst.toFixed(2)}`;
        document.getElementById('checkout-total').textContent =
            `₹${total.toFixed(2)}`;

        document.querySelectorAll('.payment-method').forEach((method) => {
            method.addEventListener('click', (e) => {
                if (e.target.type !== 'radio') {
                    const radio = method.querySelector('input[type="radio"]');
                    if (radio) radio.checked = true;

                    document
                        .querySelectorAll('.payment-method')
                        .forEach((m) => m.classList.remove('active'));
                    method.classList.add('active');
                }
            });
        });

        const addAddressBtn = document.getElementById('add-address-btn');
        if (addAddressBtn) {
            addAddressBtn.onclick = () => {
                document
                    .getElementById('address-modal')
                    .classList.add('active');
            };
        }

        const payNowBtn = document.getElementById('pay-now-btn');
        if (payNowBtn) {
            payNowBtn.onclick = async () => {
                const selectedMethod = document.querySelector(
                    'input[name="payment-method"]:checked'
                );
                if (!selectedMethod) {
                    router.showToast(
                        'Please select a payment method',
                        'error'
                    );
                    return;
                }

                document
                    .getElementById('loading-modal')
                    .classList.add('active');

                try {
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    const orderData = {
                        userId: state.currentUser.id,
                        items: state.cart.map((item) => ({
                            id: item.id,
                            name: item.name,
                            price: item.discountPrice,
                            quantity: item.quantity,
                            requiresPrescription: item.requiresPrescription
                        })),
                        total,
                        paymentMethod: selectedMethod.id.replace('payment-', ''),
                        paymentStatus: 'SUCCESS',
                        address:
                            state.addresses.find((a) => a.isDefault) ||
                            state.addresses[0],
                        prescriptionRequired: state.cart.some(
                            (item) => item.requiresPrescription
                        ),
                        prescriptionId:
                            state.prescriptions.length > 0
                                ? state.prescriptions[0].id
                                : null
                    };

                    const order = await api.placeOrder(orderData);

                    state.cart = [];
                    storage.saveCart(state.cart);
                    updateCartBadge();

                    document
                        .getElementById('loading-modal')
                        .classList.remove('active');

                    router.navigate(`/order-confirmation/${order.id}`);
                } catch (error) {
                    document
                        .getElementById('loading-modal')
                        .classList.remove('active');
                    router.showToast(
                        'Payment failed. Please try again.',
                        'error'
                    );
                }
            };
        }

        const closeAddress = document.getElementById('close-address');
        const cancelAddress = document.getElementById('cancel-address');
        const saveAddress = document.getElementById('save-address');
        const addressModal = document.getElementById('address-modal');

        const closeModal = () => {
            if (addressModal) addressModal.classList.remove('active');
        };

        if (closeAddress) closeAddress.onclick = closeModal;
        if (cancelAddress) cancelAddress.onclick = closeModal;

        if (saveAddress) {
            saveAddress.onclick = () => {
                const type = document.getElementById('address-type').value;
                const name = document.getElementById('full-name').value;
                const phone = document.getElementById('phone').value;
                const pincode = document.getElementById('pincode').value;
                const address = document.getElementById('address').value;
                const city = document.getElementById('city').value;
                const stateName = document.getElementById('state').value;

                const newAddress = {
                    id: Date.now().toString(),
                    type,
                    name,
                    phone,
                    pincode,
                    address,
                    city,
                    state: stateName,
                    isDefault: state.addresses.length === 0
                };

                state.addresses.push(newAddress);
                storage.saveAddresses(state.addresses);

                closeModal();
                views.checkout();
                router.showToast('Address added successfully', 'success');
            };
        }

        if (addressModal) {
            addressModal.addEventListener('click', (e) => {
                if (e.target === addressModal) closeModal();
            });
        }
    },

    'order-confirmation'(params) {
        const orderId = params.orderId;
        const order = state.orders.find((o) => o.id === orderId);
        const container = document.getElementById('order-details');

        if (!container) return;

        if (!order) {
            container.innerHTML = '<p>Order not found</p>';
            return;
        }

        const user = state.users.find((u) => u.id === order.userId) || state.currentUser;

        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Order Date:</strong> ${new Date(
                    order.date
                ).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${
                    user ? user.name : 'Customer'
                } (${user ? user.age : 'N/A'} years)</p>
                <p><strong>Delivery Address:</strong> ${
                    order.address.address
                }</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                <p><strong>Estimated Delivery:</strong> ${
                    order.deliveryEstimate
                }</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>Order Items</h4>
                ${order.items
                    .map(
                        (item) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `
                    )
                    .join('')}
            </div>
            <div style="border-top: 1px solid var(--light-gray); padding-top: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>₹${order.total.toFixed(2)}</strong></span>
                </div>
                <div style="font-size: 14px; color: var(--gray);">Inclusive of GST</div>
            </div>
        `;

        const downloadBtn = document.getElementById('download-invoice-btn');
        const trackBtn = document.getElementById('track-order-btn');
        const continueBtn = document.getElementById('continue-shopping-btn');

        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const invoiceContent = `
MediSwift Kolkata
Order Invoice

Order ID: ${order.id}
Order Date: ${new Date(order.date).toLocaleDateString()}

Customer Details:
Name: ${user ? user.name : 'Customer'}
Age: ${user ? user.age : 'N/A'}
Phone: ${user ? user.phone : 'N/A'}

Delivery Address:
${order.address.address}
${order.address.city}, ${order.address.state} - ${order.address.pincode}

Order Items:
${order.items
    .map(
        (item) =>
            `- ${item.name} (Qty: ${item.quantity}) - ₹${(
                item.price * item.quantity
            ).toFixed(2)}`
    )
    .join('\n')}

Total Amount: ₹${order.total.toFixed(2)}
(Inclusive of GST)

Thank you for your order!
                `;

                const blob = new Blob([invoiceContent], {
                    type: 'text/plain'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `medswift-order-${order.id}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                router.showToast(
                    'Invoice downloaded successfully',
                    'success'
                );
            };
        }

        if (trackBtn) {
            trackBtn.onclick = () => {
                router.navigate(`/order-tracking/${order.id}`);
            };
        }

        if (continueBtn) {
            continueBtn.onclick = () => {
                router.navigate('/products');
            };
        }
    },

    'order-tracking'(params) {
        const container = document.getElementById('tracking-details');
        if (!container) return;

        const orderId = params.orderId;

        // If no specific order, show an "enter order ID" form
        if (!orderId) {
            container.innerHTML = `
                <p>Enter your Order ID to track your order:</p>
                <form id="track-order-form" class="track-order-form">
                    <div class="form-group">
                        <label class="form-label" for="track-order-id">Order ID</label>
                        <input type="text" id="track-order-id" class="form-control" placeholder="e.g. ORD1699999999999" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Track Order</button>
                </form>
            `;

            const form = document.getElementById('track-order-form');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    const idInput = document.getElementById('track-order-id');
                    const enteredId = idInput.value.trim();
                    if (!enteredId) return;
                    router.navigate(`/order-tracking/${enteredId}`);
                };
            }
            return;
        }

        const order = state.orders.find((o) => o.id === orderId);

        if (!order) {
            container.innerHTML = `
                <p>Order not found.</p>
                <p>Please check your Order ID or try again.</p>
            `;
            return;
        }
        const statuses = [
            {
                status: 'CONFIRMED',
                label: 'Order Confirmed',
                description: 'Your order has been confirmed',
                date: '16 Nov 2025, 10:30 AM'
            },
            {
                status: 'PRESCRIPTION_VERIFIED',
                label: 'Prescription Verified',
                description: 'Your prescription has been verified',
                date: '16 Nov 2025, 11:15 AM'
            },
            {
                status: 'PACKED',
                label: 'Packed',
                description: 'Your order has been packed',
                date: '16 Nov 2025, 02:45 PM'
            },
            {
                status: 'OUT_FOR_DELIVERY',
                label: 'Out for Delivery',
                description: 'Your order is out for delivery',
                date: '17 Nov 2025, 09:30 AM'
            },
            {
                status: 'DELIVERED',
                label: 'Delivered',
                description: 'Your order has been delivered',
                date: '17 Nov 2025, 02:15 PM'
            }
        ];

        const currentStatusIndex = statuses.findIndex(
            (s) => s.status === order.status
        );
        const safeIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

        container.innerHTML = `
            <div style="margin-bottom: 30px;">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Estimated Delivery:</strong> ${
                    order.deliveryEstimate
                }</p>
            </div>

            <div class="timeline">
                ${statuses
                    .map(
                        (status, index) => `
                    <div class="timeline-item ${
                        index < safeIndex ? 'completed' : ''
                    } ${index === safeIndex ? 'active' : ''}">
                        <div class="timeline-content">
                            <h4>${status.label}</h4>
                            <p>${status.description}</p>
                            <div class="timeline-date">${status.date}</div>
                            ${
                                index === safeIndex
                                    ? `<p style="color: var(--primary); font-weight: 500;">Current Status</p>`
                                    : ''
                            }
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>

            <div style="margin-top: 30px;">
                <h3>Order Summary</h3>
                ${order.items
                    .map(
                        (item) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `
                    )
                    .join('')}
                <div style="border-top: 1px solid var(--light-gray); padding-top: 10px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-weight: 600;">
                        <span>Total:</span>
                        <span>₹${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    profile() {
        // Tabs switching
        document.querySelectorAll('.profile-tab').forEach((tab) => {
            tab.onclick = () => {
                document
                    .querySelectorAll('.profile-tab')
                    .forEach((t) => t.classList.remove('active'));
                document
                    .querySelectorAll('.profile-content')
                    .forEach((c) => c.classList.remove('active'));

                tab.classList.add('active');
                document
                    .getElementById(`${tab.dataset.tab}-content`)
                    .classList.add('active');
            };
        });

        // Load user orders
        const ordersContainer = document.getElementById('user-orders');
        if (ordersContainer) {
            const userOrders = state.orders.filter(
                (o) => state.currentUser && o.userId === state.currentUser.id
            );

            if (userOrders.length === 0) {
                ordersContainer.innerHTML = '<p>No orders found</p>';
            } else {
                ordersContainer.innerHTML = userOrders
                    .map(
                        (order) => `
                    <div class="order-item">
                        <div class="order-header">
                            <div>
                                <strong>Order ID: ${order.id}</strong>
                                <div style="font-size: 14px; color: var(--gray);">${new Date(
                                    order.date
                                ).toLocaleDateString()}</div>
                            </div>
                            <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                            <div>${order.items.length} item(s) - ₹${order.total.toFixed(
                            2
                        )}</div>
                            <div>
                                <button class="btn btn-outline btn-sm" data-order="${
                                    order.id
                                }" data-action="view">View</button>
                                <button class="btn btn-outline btn-sm" data-order="${
                                    order.id
                                }" data-action="download">Download Invoice</button>
                            </div>
                        </div>
                    </div>
                `
                    )
                    .join('');

                document
                    .querySelectorAll('[data-action="view"]')
                    .forEach((btn) => {
                        btn.onclick = () => {
                            const orderId = btn.dataset.order;
                            router.navigate(
                                `/order-confirmation/${orderId}`
                            );
                        };
                    });

                document
                    .querySelectorAll('[data-action="download"]')
                    .forEach((btn) => {
                        btn.onclick = () => {
                            const orderId = btn.dataset.order;
                            const order = state.orders.find(
                                (o) => o.id === orderId
                            );
                            if (!order) return;

                            const user = state.users.find(
                                (u) => u.id === order.userId
                            );

                            const invoiceContent = `
MediSwift Kolkata
Order Invoice

Order ID: ${order.id}
Order Date: ${new Date(order.date).toLocaleDateString()}

Customer Details:
Name: ${user ? user.name : 'Customer'}
Age: ${user ? user.age : 'N/A'}
Phone: ${user ? user.phone : 'N/A'}

Delivery Address:
${order.address.address}
${order.address.city}, ${order.address.state} - ${order.address.pincode}

Order Items:
${order.items
    .map(
        (item) =>
            `- ${item.name} (Qty: ${item.quantity}) - ₹${(
                item.price * item.quantity
            ).toFixed(2)}`
    )
    .join('\n')}

Total Amount: ₹${order.total.toFixed(2)}
(Inclusive of GST)

Thank you for your order!
                            `;

                            const blob = new Blob([invoiceContent], {
                                type: 'text/plain'
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `medswift-order-${order.id}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);

                            router.showToast(
                                'Invoice downloaded successfully',
                                'success'
                            );
                        };
                    });
            }
        }
    },

    support() {
        const supportForm = document.getElementById('support-form');
        if (supportForm) {
            supportForm.onsubmit = (e) => {
                e.preventDefault();
                router.showToast(
                    'Your message has been sent. We will get back to you soon.',
                    'success'
                );
                supportForm.reset();
            };
        }

        document.querySelectorAll('.faq-question').forEach((question) => {
            question.onclick = () => {
                const item = question.parentElement;
                item.classList.toggle('active');
            };
        });

        const startChatBtn = document.getElementById('start-chat-btn');
        const chatModal = document.getElementById('chat-modal');
        const closeChat = document.getElementById('close-chat');

        if (startChatBtn && chatModal) {
            startChatBtn.onclick = () => chatModal.classList.add('active');
        }
        if (closeChat && chatModal) {
            closeChat.onclick = () => chatModal.classList.remove('active');
            chatModal.addEventListener('click', (e) => {
                if (e.target === chatModal) chatModal.classList.remove('active');
            });
        }
    },

    telemedicine() {
        // Main "Book an Appointment" button in telemedicine hero
        const mainBookBtn = document.querySelector(
            '#telemedicine-view .telemedicine-section .btn.btn-primary'
        );
        if (mainBookBtn) {
            mainBookBtn.onclick = () => {
                openAppointmentModal();
            };
        }

        // Each doctor "Book Now" button
        document
            .querySelectorAll('#telemedicine-view .doctor-card .btn')
            .forEach((btn) => {
                btn.onclick = () => {
                    openAppointmentModal();
                };
            });
    },

    admin() {
        document.querySelectorAll('.admin-nav a').forEach((link) => {
            link.onclick = (e) => {
                e.preventDefault();
                document
                    .querySelectorAll('.admin-nav a')
                    .forEach((a) => a.classList.remove('active'));
                link.classList.add('active');
                router.showToast(
                    `Admin section: ${link.textContent}`,
                    'info'
                );
            };
        });
    },

    wishlist() {
        router.showToast('Wishlist feature would be implemented here', 'info');
        router.navigate('/');
    },

    wallet() {
        router.showToast('Wallet feature would be implemented here', 'info');
        router.navigate('/profile');
    },

    'refill-reminders'() {
        router.showToast(
            'Refill reminders feature would be implemented here',
            'info'
        );
        router.navigate('/profile');
    }
};

// Components
const components = {
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const isInWishlist = state.wishlist.some((item) => item.id === product.id);
        const discountPercent = Math.round(
            (1 - product.discountPrice / product.mrp) * 100
        );

        card.innerHTML = `
            ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
            ${
                discountPercent > 20
                    ? `<div class="product-badge" style="background-color: var(--success);">${discountPercent}% OFF</div>`
                    : ''
            }
            <div class="product-image">
                <i class="fas fa-pills"></i>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-brand">${product.brand}</div>
                <div class="product-price">
                    <span class="current-price">₹${product.discountPrice}</span>
                    <span class="original-price">₹${product.mrp}</span>
                    <span class="discount">${discountPercent}% OFF</span>
                </div>
                <div class="product-meta">
                    <span>${product.type}</span>
                    <span>${product.stock} in stock</span>
                </div>
                ${
                    product.requiresPrescription
                        ? '<div class="prescription-tag"><i class="fas fa-prescription"></i> Prescription Required</div>'
                        : ''
                }
                <div class="product-actions">
                    <button class="btn-add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist ${
                        isInWishlist ? 'active' : ''
                    }" data-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;

        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                const existingItem = state.cart.find(
                    (item) => item.id === product.id
                );

                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    state.cart.push({
                        ...product,
                        quantity: 1
                    });
                }

                storage.saveCart(state.cart);
                updateCartBadge();
                router.showToast('Product added to cart', 'success');
            };
        }

        const wishlistBtn = card.querySelector('.btn-wishlist');
        if (wishlistBtn) {
            wishlistBtn.onclick = () => {
                const inWishlist = state.wishlist.some(
                    (item) => item.id === product.id
                );

                if (inWishlist) {
                    state.wishlist = state.wishlist.filter(
                        (item) => item.id !== product.id
                    );
                    wishlistBtn.classList.remove('active');
                    router.showToast('Removed from wishlist', 'info');
                } else {
                    state.wishlist.push(product);
                    wishlistBtn.classList.add('active');
                    router.showToast('Added to wishlist', 'success');
                }

                storage.saveWishlist(state.wishlist);
                updateWishlistBadge();
            };
        }

        const nameEl = card.querySelector('.product-name');
        if (nameEl) {
            nameEl.style.cursor = 'pointer';
            nameEl.onclick = () => {
                router.navigate(`/product/${product.id}`);
            };
        }

        return card;
    }
};

// Utility Functions
function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (!cartBadge) return;
    const totalItems = state.cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateWishlistBadge() {
    const wishlistBadge = document.getElementById('wishlist-badge');
    if (!wishlistBadge) return;
    const totalItems = state.wishlist.length;
    wishlistBadge.textContent = totalItems;
    wishlistBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function initializeData() {
    state.users = storage.getUsers();
    state.currentUser = storage.getCurrentUser();
    state.cart = storage.getCart();
    state.wishlist = storage.getWishlist();
    state.products = storage.getProducts();
    state.orders = storage.getOrders();
    state.prescriptions = storage.getPrescriptions();
    state.addresses = storage.getAddresses();
    state.appointments = storage.getAppointments();

    if (state.products.length === 0) {
        state.products = [
            {
                id: '1',
                name: 'Paracetamol 500mg',
                brand: 'Cipla',
                manufacturer: 'Cipla Ltd',
                type: 'tablets',
                mrp: 50,
                discountPrice: 40,
                requiresPrescription: false,
                stock: 100,
                description:
                    'Used for relief of fever and mild to moderate pain.',
                saltComposition: 'Paracetamol (500mg)',
                featured: true
            },
            {
                id: '2',
                name: 'Amoxicillin 250mg',
                brand: 'Sun Pharma',
                manufacturer: 'Sun Pharmaceutical Industries Ltd',
                type: 'capsules',
                mrp: 120,
                discountPrice: 95,
                requiresPrescription: true,
                stock: 50,
                description:
                    'Antibiotic used to treat a number of bacterial infections.',
                saltComposition: 'Amoxicillin (250mg)',
                featured: true
            },
            {
                id: '3',
                name: 'Cetirizine 10mg',
                brand: 'GSK',
                manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
                type: 'tablets',
                mrp: 35,
                discountPrice: 28,
                requiresPrescription: false,
                stock: 200,
                description:
                    'Used for allergic rhinitis, dermatitis, and urticaria.',
                saltComposition: 'Cetirizine (10mg)',
                featured: false
            },
            {
                id: '4',
                name: 'Vitamin C Syrup',
                brand: 'Himalaya',
                manufacturer: 'Himalaya Wellness',
                type: 'syrups',
                mrp: 180,
                discountPrice: 150,
                requiresPrescription: false,
                stock: 30,
                description:
                    'Immunity booster syrup with natural ingredients.',
                saltComposition: 'Ascorbic Acid (100mg/5ml)',
                featured: true
            },
            {
                id: '5',
                name: 'Insulin Injection',
                brand: 'Novo Nordisk',
                manufacturer: 'Novo Nordisk India Pvt Ltd',
                type: 'injections',
                mrp: 450,
                discountPrice: 420,
                requiresPrescription: true,
                stock: 20,
                description:
                    'Used for the treatment of diabetes mellitus.',
                saltComposition: 'Insulin (100 IU/ml)',
                featured: false
            },
            {
                id: '6',
                name: "Omeprazole 20mg",
                brand: "Dr. Reddy's",
                manufacturer: "Dr. Reddy's Laboratories Ltd",
                type: 'capsules',
                mrp: 85,
                discountPrice: 70,
                requiresPrescription: false,
                stock: 80,
                description:
                    'Used for gastroesophageal reflux disease and peptic ulcer disease.',
                saltComposition: 'Omeprazole (20mg)',
                featured: true
            },
            {
                id: '7',
                name: 'Ashwagandha Tablets',
                brand: 'Dabur',
                manufacturer: 'Dabur India Ltd',
                type: 'ayurveda',
                mrp: 200,
                discountPrice: 160,
                requiresPrescription: false,
                stock: 60,
                description:
                    'Ayurvedic medicine for stress relief and immunity.',
                saltComposition: 'Withania Somnifera Extract (500mg)',
                featured: false
            },
            {
                id: '8',
                name: 'Hand Sanitizer',
                brand: 'Dettol',
                manufacturer: 'Reckitt Benckiser',
                type: 'personal-care',
                mrp: 100,
                discountPrice: 75,
                requiresPrescription: false,
                stock: 150,
                description: 'Kills 99.9% germs without water.',
                saltComposition: 'Ethyl Alcohol (70%)',
                featured: false
            }
        ];
        storage.saveProducts(state.products);
    }

    if (state.users.length === 0) {
        state.users.push({
            id: '1',
            name: 'Admin User',
            age: 30,
            email: 'admin@mediswift.in',
            phone: '9876543210',
            address: '3rd Floor, Park Street, Kolkata, West Bengal - 700016',
            password: 'admin123',
            walletBalance: 1000,
            joinedDate: new Date().toISOString()
        });
        storage.saveUsers(state.users);
    }

    updateCartBadge();
    updateWishlistBadge();
}

// AI Chat Bot Functionality
const chatBot = {
    isOpen: false,
    messages: [],

    init() {
        this.toggleButton = document.getElementById('chat-bot-toggle');
        this.container = document.getElementById('chat-bot-container');
        this.messagesContainer =
            document.getElementById('chat-bot-messages');
        this.input = document.getElementById('chat-bot-input');
        this.sendButton = document.getElementById('chat-bot-send');
        this.closeButton = document.getElementById('chat-bot-close');

        if (
            !this.toggleButton ||
            !this.container ||
            !this.messagesContainer ||
            !this.input ||
            !this.sendButton ||
            !this.closeButton
        ) {
            return;
        }

        this.setupEventListeners();
        this.loadChatHistory();
    },

    setupEventListeners() {
        this.toggleButton.addEventListener('click', () => this.toggle());
        this.closeButton.addEventListener('click', () => this.close());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.querySelectorAll('.quick-question').forEach((button) => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                this.input.value = question;
                this.sendMessage();
            });
        });
    },

    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.container.classList.add('active');
            this.input.focus();
            this.toggleButton.classList.remove('pulse');
        } else {
            this.container.classList.remove('active');
        }
    },

    close() {
        this.isOpen = false;
        this.container.classList.remove('active');
    },

    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.input.value = '';

        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    },

    addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message message-${sender}`;
        messageElement.innerHTML = `<p>${text}</p>`;

        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop =
            this.messagesContainer.scrollHeight;

        this.messages.push({
            text,
            sender,
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();
    },

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            HealthCart+ Assistant is typing
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.messagesContainer.appendChild(typingElement);
        this.messagesContainer.scrollTop =
            this.messagesContainer.scrollHeight;
    },

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) typingElement.remove();
    },

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        if (
            lowerMessage.includes('delivery') ||
            lowerMessage.includes('timing')
        ) {
            return 'HealthCart+ provides fast delivery across India! Kolkata deliveries arrive in 2–4 hours. Other metro cities: 1–2 days. PAN India: 3–5 business days. Emergency delivery available 24/7 for critical medicines.';
        }

        if (
            lowerMessage.includes('prescription') ||
            lowerMessage.includes('prescribe')
        ) {
            return 'Prescription is required only for Schedule H medicines. OTC medicines do not require prescriptions. You can upload your prescription in the Prescription section on HealthCart+.';
        }

        if (
            lowerMessage.includes('upload') &&
            lowerMessage.includes('prescription')
        ) {
            return 'To upload your prescription: Go to Prescription → Upload File → Select Image/PDF → Submit. HealthCart+ team verifies prescriptions within 2 hours.';
        }

        if (
            lowerMessage.includes('payment') ||
            lowerMessage.includes('pay')
        ) {
            return 'HealthCart+ supports UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD). All transactions are secured and encrypted.';
        }

        if (
            lowerMessage.includes('return') ||
            lowerMessage.includes('refund')
        ) {
            return 'Due to health regulations, medicines cannot be returned once delivered. If you receive wrong, damaged, or expired items, HealthCart+ will process an instant refund or replacement.';
        }

        if (
            lowerMessage.includes('emergency') ||
            lowerMessage.includes('urgent')
        ) {
            return 'HealthCart+ offers 2-hour emergency medicine delivery in Kolkata. Call our 24/7 helpline: +91-98765-43210.';
        }

        if (
            lowerMessage.includes('discount') ||
            lowerMessage.includes('offer')
        ) {
            return 'Use code HEALTH20 for 20% off your first HealthCart+ order. Senior citizens receive an additional 10% discount.';
        }

        if (
            lowerMessage.includes('contact') ||
            lowerMessage.includes('support')
        ) {
            return 'HealthCart+ Support: 📞 +91-98765-43210 | 📧 support@healthcartplus.in | 🏢 Park Street, Kolkata. Available 24/7.';
        }

        if (
            lowerMessage.includes('hello') ||
            lowerMessage.includes('hi') ||
            lowerMessage.includes('hey')
        ) {
            return "Hello! I'm the HealthCart+ AI Assistant. I can help you with orders, delivery, prescriptions, payments, discounts, and more. How can I assist you today?";
        }

        return (
            "You asked: '" +
            userMessage +
            "'. HealthCart+ Assistant can help with medicines, delivery, payments, prescriptions, and support. Please rephrase your question or contact support anytime!"
        );
    },

    saveChatHistory() {
        localStorage.setItem(
            'healthcart_chat_history',
            JSON.stringify(this.messages)
        );
    },

    loadChatHistory() {
        const saved = localStorage.getItem('healthcart_chat_history');
        if (saved) {
            this.messages = JSON.parse(saved);
            const recentMessages = this.messages.slice(-10);
            this.messagesContainer.innerHTML = '';
            recentMessages.forEach((msg) => {
                this.addMessage(msg.text, msg.sender);
            });
        }
    }
};

// Enhanced Logout Functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const logoutCancel = document.getElementById('logout-cancel');
    const logoutConfirm = document.getElementById('logout-confirm');

    if (!logoutBtn || !logoutModal) return;

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentUser) {
            logoutModal.classList.add('active');
        } else {
            router.showToast('You are not logged in', 'info');
        }
    });

    if (logoutCancel) {
        logoutCancel.onclick = () => {
            logoutModal.classList.remove('active');
        };
    }

    if (logoutConfirm) {
        logoutConfirm.onclick = () => {
            state.currentUser = null;
            storage.logoutUser();

            state.cart = [];
            state.wishlist = [];
            state.prescriptions = [];

            storage.saveCart(state.cart);
            storage.saveWishlist(state.wishlist);
            storage.savePrescriptions(state.prescriptions);

            updateCartBadge();
            updateWishlistBadge();

            logoutModal.classList.remove('active');
            router.showToast('Logged out successfully', 'success');
            router.navigate('/');
        };
    }

    logoutModal.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
            logoutModal.classList.remove('active');
        }
    });
}

// Appointment Modal
function openAppointmentModal() {
    const modal = document.getElementById('appointment-modal');
    if (!modal) return;

    const form = document.getElementById('appointment-form');
    if (form) form.reset();

    if (state.currentUser) {
        const nameInput = document.getElementById('patient-name');
        const phoneInput = document.getElementById('patient-phone');
        const ageInput = document.getElementById('patient-age');

        if (nameInput) nameInput.value = state.currentUser.name || '';
        if (phoneInput) phoneInput.value = state.currentUser.phone || '';
        if (ageInput) ageInput.value = state.currentUser.age || '';
    }

    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        if (!dateInput.value) dateInput.value = today;
    }

    modal.classList.add('active');
}

function setupAppointmentModal() {
    const modal = document.getElementById('appointment-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('close-appointment');
    const cancelBtn = document.getElementById('cancel-appointment');
    const confirmBtn = document.getElementById('confirm-appointment');
    const form = document.getElementById('appointment-form');

    const close = () => modal.classList.remove('active');

    if (closeBtn) closeBtn.onclick = close;
    if (cancelBtn) cancelBtn.onclick = close;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    if (confirmBtn && form) {
        confirmBtn.onclick = () => {
            if (!form.reportValidity()) return;

            const data = {
                id: 'APT' + Date.now(),
                name: document.getElementById('patient-name').value,
                age: document.getElementById('patient-age').value,
                gender: document.getElementById('patient-gender').value,
                phone: document.getElementById('patient-phone').value,
                type: document.getElementById('appointment-type').value,
                specialty: document.getElementById('specialty').value,
                date: document.getElementById('appointment-date').value,
                time: document.getElementById('appointment-time').value,
                symptoms: document.getElementById('symptoms').value
            };

            state.appointments.push(data);
            storage.saveAppointments(state.appointments);

            router.showToast('Your appointment has been booked!', 'success');
            close();
        };
    }

    const headerBookBtn = document.getElementById('book-appointment-btn');
    if (headerBookBtn) {
        headerBookBtn.onclick = (e) => {
            e.preventDefault();
            openAppointmentModal();
        };
    }
}

// Extra: auto-open "My Orders" tab when clicking Order History in dropdown
function setupOrderHistoryShortcut() {
    const orderHistoryLink = document.querySelector('.order-history-link');
    if (!orderHistoryLink) return;

    orderHistoryLink.addEventListener('click', () => {
        setTimeout(() => {
            const ordersTab = document.querySelector(
                '.profile-tab[data-tab="orders"]'
            );
            const ordersContent = document.getElementById('orders-content');

            if (ordersTab && ordersContent) {
                document
                    .querySelectorAll('.profile-tab')
                    .forEach((t) => t.classList.remove('active'));
                document
                    .querySelectorAll('.profile-content')
                    .forEach((c) => c.classList.remove('active'));

                ordersTab.classList.add('active');
                ordersContent.classList.add('active');
            }
        }, 100);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    router.init();
    chatBot.init();
    setupLogout();
    setupAppointmentModal();
    setupOrderHistoryShortcut();

    const firstVisit = !localStorage.getItem('healthcart_visited');
    if (firstVisit) {
        setTimeout(() => {
            chatBot.toggle();
            localStorage.setItem('healthcart_visited', 'true');
        }, 3000);
    }
});



