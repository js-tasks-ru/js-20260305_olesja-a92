import { escapeHtml } from '../../shared/utils/escape-html';
import { fetchJson } from '../../shared/utils/fetch-json';
import { createElement } from "../../shared/utils/create-element";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

interface ProductImage {
  url: string;
  source: string;
}

interface ImgurUploadResponse {
  data: {
    link: string;
  };
}

interface Subcategory {
  id: string;
  title: string;
  count: number;
  category: string;
  weight: number;
}

interface Category {
  id: string;
  title: string;
  count: number;
  weight: number;
  subcategories: Subcategory[];
}

interface Product {
  id: string;
  title: string;
  description: string;
  quantity: number;
  subcategory: string;
  status: number;
  images: ProductImage[];
  price: number;
  discount: number;
}

interface SaveResult {
  id: string;
}

export default class ProductForm {
  productId?: string;
  element: HTMLElement | null = null;
  form: HTMLFormElement | null = null;
  uploadBtn: HTMLButtonElement | null = null;
  uploadInput: HTMLInputElement | null = null;
  private categories: Category[] = [];
  private product: Product[] | null = null;

  constructor(productId?: string) {
    this.productId = productId;
  }

  private get template(){
    const categoriesHtml = this.renderCategories(this.categories);

    return `
    <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list"></ul>
             </div>
             <input type="file" id="uploadImage" accept="image/*" hidden>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
                ${categoriesHtml}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
    </div>`;
  }

  async render(): Promise<HTMLElement | null> {
     [this.categories, this.product] = await Promise.all([
      fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`),
      this.productId ? fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`) : Promise.resolve([])
    ]) as [Category[], Product[]];;

    this.element = createElement(this.template);
    this.form = this.element.querySelector<HTMLFormElement>('[data-element="productForm"]');

    if(!this.form){
      return null;
    }

    this.form.addEventListener('submit', this.onSubmit);

    this.uploadBtn = this.element.querySelector('[name="uploadImage"]');
    this.uploadInput = this.element.querySelector<HTMLInputElement>('#uploadImage');

    this.uploadBtn?.addEventListener('click', this.onUploadBtnClick);
    this.uploadInput?.addEventListener('change', this.onUploadImage);

    if(this.product && this.product[0]) {
      const product = this.product[0] as Product;

      (this.form.querySelector('#title') as HTMLInputElement).value = product.title;
      (this.form.querySelector('#description') as HTMLTextAreaElement).value = product.description;
      (this.form.querySelector('#subcategory') as HTMLSelectElement).value = product.subcategory;
      (this.form.querySelector('#discount') as HTMLInputElement).value = String(product.discount);
      (this.form.querySelector('#quantity') as HTMLInputElement).value = String(product.quantity);
      (this.form.querySelector('#status') as HTMLSelectElement).value = String(product.status);
      (this.form.querySelector('#price') as HTMLInputElement).value = String(product.price);
      const imageContainer = this.form.querySelector('[data-element="imageListContainer"]');
      if (imageContainer) imageContainer.innerHTML = this.renderImages(product.images);
    }

    return this.element;
  }

  private renderCategories(categories: Category[]){
    return categories.map(category =>
      category.subcategories.map(sub =>
        `<option value="${sub.id}">${escapeHtml(category.title)} > ${escapeHtml(sub.title)}</option>`
      ).join('')
    ).join('');
  }

  private renderImages(images: ProductImage[]){
    return `<ul class="sortable-list">
                ${images.map(image => this.renderImageItem(image)).join('')}
            </ul>`;
  }

  private renderImageItem(image: ProductImage){
    return `<li class="products-edit__imagelist-item sortable-list__item">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${image.source}" src="${image.url}">
            <span>${escapeHtml(image.source)}</span>
        </span>
        <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
    </li>`;
  }

  async save(): Promise<void> {
    if(!this.element) {
      return;
    }

    if(!this.form) {
      return;
    }

    const imageInputs = this.form.querySelectorAll('[data-element="imageListContainer"] .products-edit__imagelist-item');
    const images = Array.from(imageInputs).map(item => ({
      url: (item.querySelector('[name="url"]') as HTMLInputElement).value,
      source: (item.querySelector('[name="source"]') as HTMLInputElement).value,
    }));

    const product = {
        ...(this.productId ? { id: this.productId } : {}),
      title: (this.form.querySelector('#title') as HTMLInputElement).value,
      description: (this.form.querySelector('#description') as HTMLTextAreaElement).value,
      subcategory: (this.form.querySelector('#subcategory') as HTMLSelectElement).value,
      discount: Number((this.form.querySelector('#discount') as HTMLInputElement).value),
      price: Number((this.form.querySelector('#price') as HTMLInputElement).value),
      quantity: Number((this.form.querySelector('#quantity') as HTMLInputElement).value),
      status: Number((this.form.querySelector('#status') as HTMLSelectElement).value),
      images: images,
    };

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        body: JSON.stringify(product),
        headers: {'Content-Type': 'application/json'}
      }) as SaveResult;
      const eventName = this.productId ? 'product-updated' : 'product-saved';
      this.element.dispatchEvent(new CustomEvent(eventName, {
        bubbles: true,
        ...(this.productId ? { detail: result.id } : {})
      }));
    } catch (error) {
      console.error('Ошибка сохранения продукта:', error);
    }
  }

  private onSubmit = async (event: Event) => {
    event.preventDefault();
    await this.save();
  }

  private onUploadBtnClick = () => this.uploadInput?.click();

  private onUploadImage = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    this.uploadBtn?.classList.add('is-loading');
    try {
      const result = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { 'Authorization': `Client-ID ${IMGUR_CLIENT_ID}` },
        body: formData
      }) as ImgurUploadResponse;

      const imageList = (this.element?.querySelector('[data-element="imageListContainer"] .sortable-list') as HTMLUListElement);
      if (imageList) {
        imageList.insertAdjacentHTML('beforeend', this.renderImageItem({
          url: result.data.link,
          source: file.name
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      this.uploadBtn?.classList.remove('is-loading');
    }
  }

  public remove(){
    if(!this.element){
      return;
    }
    this.element.remove();
  }

  public destroy(){
    this.remove();
    this.uploadBtn?.removeEventListener('click', this.onUploadBtnClick);
    this.uploadInput?.removeEventListener('change', this.onUploadImage);
    this.form?.removeEventListener('submit', this.onSubmit);
    this.element = null;
    this.product = null
    this.categories = [];
  }
}
