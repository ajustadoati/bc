import { Component } from '@angular/core';
import { CatalogKind } from '../../shared/management.models';
import { CatalogFormBase, CATALOG_FORM_IMPORTS } from '../catalog-form.page';

@Component({ selector: 'app-add-workshop-modal', templateUrl: '../catalog-form.page.html', styleUrls: ['../../shared/management.scss'], standalone: true, imports: CATALOG_FORM_IMPORTS })
export class AddWorkshopModalPage extends CatalogFormBase {
  override kind: CatalogKind = 'workshops';
}
