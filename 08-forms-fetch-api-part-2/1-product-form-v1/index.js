import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  product = {};
  categories = [];

  subElements = {};

  api = '/api/rest/';

  onClickDeleteImage = event => {
  }

  onSubmit = event => {
    event.preventDefault();
    console.log(new FormData(this.subElements['productForm']));

    this.save();
  }

  constructor(productId = null) {
    this.productId = productId;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  async render() {
    this.categories = await this.getCategories();
    this.element = this.getElementFromTemplate(this.template);
    document.body.append(this.element);

    this.subElements = this.getSubElements();

    if (this.productId) {
      this.product = await this.getProductInfo();

      this.setProductData();
    }

    this.initEventListeners();
  }

  async getProductInfo(id = this.productId) {
    const url = new URL(`${this.api}products`, BACKEND_URL);
    url.searchParams.set('id', id);

    const data = await fetchJson(url);
    return data[0];
  }

  getCategories() {
    const url = new URL(`${this.api}categories`, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return fetchJson(url);
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${this.titleTemplate}
          ${this.descriptionTemplate}
          ${this.imagesTemplate}
          ${this.categoriesTemplate}
          ${this.priceTemplate}
          ${this.numberTemplate}
          ${this.statusTemplate}
          <div class="form-buttons">
            <button type="submit" id="save" class="button-primary-outline">Сохранить товар</button>
          </div>
        </form>
      </div>
    `;
  }

  get titleTemplate() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  get descriptionTemplate() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  get imagesTemplate() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list"></ul>
        </div>
        <button type="button" id="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
    `;
  }

  get categoriesTemplate() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">${this.subcategoriesTemplate}</select>
      </div>
    `;
  }

  get priceTemplate() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
    `;
  }

  get numberTemplate() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
      </div>
    `;
  }

  get statusTemplate() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
    `;
  }

  get subcategoriesTemplate() {
    return this.categories.map(category => {
      return category.subcategories.map(subcategory => {
        return `<option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`;
      }).join('');
    }).join('');
  }

  setProductData() {
    ['title', 'description', 'price', 'discount', 'quantity', 'status', 'subcategory']
      .forEach(element => {
        this.element.querySelector(`[id=${element}]`).value = this.product[element];
      });

    if (this.product.images.length) {
      this.subElements['imageListContainer'].innerHTML = this.product.images.map(({ source, url }) => `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" id="url" name="url" value="${url}">
          <input type="hidden" id="source" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${url}">
            <span>${source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `).join('');
    }
  }

  initEventListeners() {
    this.subElements['imageListContainer'].addEventListener('pointerDown', this.onClickDeleteImage);
    this.subElements['productForm'].addEventListener('submit', this.onSubmit);
  }

  removeEventListeners() {
    this.subElements['imageListContainer'].removeEventListener('pointerDown', this.onClickDeleteImage);
  }

  save() {
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
