let products = [];
const crypto = require('crypto');
function generateRandomId(length) {
    return crypto.randomBytes(length / 2).toString('hex');
}
module.exports = class Product {

    constructor(id, name, price, image, stock) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.stock = stock;
    }

    save() {
        this.id = generateRandomId(8);
        products.push(this);
        return this;
    }

    update() {
        const index = products.findIndex(p => p.id === this.id);
        if (index > -1) {
            products.splice(index, 1, this);
            return this;
        } else {
            throw new Error('NOT Found');
        }

    }

    static fetchAll() {
        return products;
    }

    static initializeData() {
        new Product(null, "Node.js", 9.99, "nodejs.svg",8).save();
            new Product(null, "React", 19.99, "react.svg",5).save();
            new Product(null, "Angular", 29.99, "angular.svg",13).save();
    }

    static findById(productId) {
        const index = products.findIndex(p => p.id === productId);
        if (index > -1) {
            return products[index];
        } else {
            throw new Error('NOT Found');
        }
    }

    static deleteById(productId) {
        const index = products.findIndex(p => p.id === productId);
        if (index > -1) {
            products = products.filter(p => p.id !== productId);
        } else {
            throw new Error('NOT Found');
        }
    }

}