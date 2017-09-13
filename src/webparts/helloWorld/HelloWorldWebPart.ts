import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox,
  PropertyPaneDropdown,
  PropertyPaneToggle

} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './HelloWorld.module.scss';
import * as strings from 'helloWorldStrings';
import { IHelloWorldWebPartProps } from './IHelloWorldWebPartProps';
import MockHttpClient  from './MockHttpClient';
import { SPHttpClient, SPHttpClientResponse  } from '@microsoft/sp-http';
import { Environment, EnvironmentType} from '@microsoft/sp-core-library';

export interface ISPLists{
  value: ISPList[];
}

export interface ISPList{
  Title: string;
  Id: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  
  private _renderListAsync(): void {
    if(Environment.type === EnvironmentType.Local){
      this._getMockListData().then((response) => {
        this._renderList(response.value);
      });
    }
     else if(Environment.type === EnvironmentType.SharePoint){
      this._getListData().then((response) => {
        this._renderList(response.value);
      });
    }
  }

  private _renderList(items: ISPList[]): void{
    let html : string ="";
    items.forEach((item: ISPList) => {
    html += `
    <ul class="${styles.list}">
			<li class="${styles.listItem}">
				<span class="ms-font-l">${item.Title}</span>
			</li>
    </ul>`;
    });
    const listContainer: Element = this.domElement.querySelector('#spListContainer');
    listContainer.innerHTML = html;
  }
  private _getListData(): Promise<ISPLists> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/web/lists?$filter=Hidden eq false`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse ) => {
        return response.json();
      });
  }

  private _getMockListData(): Promise<ISPLists>{
    return MockHttpClient.get(this.context.pageContext.web.absoluteUrl)
        .then((data:ISPList[]) =>{
          var listData: ISPLists ={ value : data};
          return listData;
        }) as Promise<ISPLists>;
  }
  public render(): void {
    this.domElement.innerHTML = `
      <div class="${styles.helloWorld}">
        <div class="${styles.container}">
          <div class="ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}">
            <div class="ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1">
              <span class="ms-font-xl ms-fontColor-white">Welcome to SharePoint!</span>
              <p class="ms-font-l ms-fontColor-white">Customize SharePoint experiences using Web Parts.</p>
              <p class="ms-font-l ms-fontColor-white">${escape(this.context.pageContext.web.title)}</p>
              <p class="ms-font-l ms-fontColor-white">${escape(this.properties.test)}</p>
              <a href="https://aka.ms/spfx" class="${styles.button}">
                <span class="${styles.label}">Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="spListContainer"/>`;
      this._renderListAsync();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description'
                }),
                PropertyPaneTextField('test', {
                  label: 'Multi-line Text Field'
                }),
                PropertyPaneCheckbox('test1',{
                  text:'Checkbox'
                }),
                PropertyPaneDropdown('test2',{
                  label: 'Dropdown',
                  options:[
                    {key: '1', text: 'One'},
                    {key: '2', text: 'Two'},
                    {key: '3', text: "Three"}
                  ]
                }),
                PropertyPaneToggle('test3', {
                  label: 'Toggle',
                  onText: 'On',
                  offText: 'Off'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
