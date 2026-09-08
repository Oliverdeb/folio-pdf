const ADDIN_ID = "8f3c1a2e-7b64-4d91-9e05-2a6b8c4d1f70";

export function outlookManifestXml(baseUrl: string): string {
  const root = baseUrl.replace(/\/$/, "");
  let appDomain = root;
  try {
    appDomain = new URL(root).origin;
  } catch {
    /* keep root */
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp
  xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
  xmlns:mailappor="http://schemas.microsoft.com/office/mailappversionoverrides/1.0"
  xsi:type="MailApp">
  <Id>${ADDIN_ID}</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Folio</ProviderName>
  <DefaultLocale>en-GB</DefaultLocale>
  <DisplayName DefaultValue="Folio PDF lock"/>
  <Description DefaultValue="Asks whether to password-protect unlocked PDFs when you attach them in Outlook. Encryption runs on this PC."/>
  <IconUrl DefaultValue="${root}/outlook/icon-32.png"/>
  <HighResolutionIconUrl DefaultValue="${root}/outlook/icon-80.png"/>
  <SupportUrl DefaultValue="${root}/outlook"/>
  <AppDomains>
    <AppDomain>${appDomain}</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Mailbox"/>
  </Hosts>
  <Requirements>
    <Sets>
      <Set Name="Mailbox" MinVersion="1.8"/>
    </Sets>
  </Requirements>
  <FormSettings>
    <Form xsi:type="ItemRead">
      <DesktopSettings>
        <SourceLocation DefaultValue="${root}/outlook/pane"/>
        <RequestedHeight>250</RequestedHeight>
      </DesktopSettings>
    </Form>
    <Form xsi:type="ItemEdit">
      <DesktopSettings>
        <SourceLocation DefaultValue="${root}/outlook/pane"/>
        <RequestedHeight>420</RequestedHeight>
      </DesktopSettings>
    </Form>
  </FormSettings>
  <Permissions>ReadWriteItem</Permissions>
  <Rule xsi:type="RuleCollection" Mode="Or">
    <Rule xsi:type="ItemIs" ItemType="Message" FormType="Edit"/>
    <Rule xsi:type="ItemIs" ItemType="Appointment" FormType="Edit"/>
  </Rule>
  <DisableEntityHighlighting>true</DisableEntityHighlighting>
  <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides" xsi:type="VersionOverridesV1_0">
    <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides/1.1" xsi:type="VersionOverridesV1_1">
      <Requirements>
        <bt:Sets DefaultMinVersion="1.12">
          <bt:Set Name="Mailbox"/>
        </bt:Sets>
      </Requirements>
      <Hosts>
        <Host xsi:type="MailHost">
          <Runtimes>
            <Runtime resid="WebViewRuntime.Url">
              <Override type="javascript" resid="JSRuntime.Url"/>
            </Runtime>
          </Runtimes>
          <DesktopFormFactor>
            <ExtensionPoint xsi:type="MessageComposeCommandSurface">
              <OfficeTab id="TabDefault">
                <Group id="folioMsgComposeGroup">
                  <Label resid="GroupLabel"/>
                  <Control xsi:type="Button" id="msgComposeOpenPaneButton">
                    <Label resid="TaskPaneButton.Label"/>
                    <Supertip>
                      <Title resid="TaskPaneButton.Label"/>
                      <Description resid="TaskPaneButton.Tooltip"/>
                    </Supertip>
                    <Icon>
                      <bt:Image size="16" resid="Icon.16x16"/>
                      <bt:Image size="32" resid="Icon.32x32"/>
                      <bt:Image size="80" resid="Icon.80x80"/>
                    </Icon>
                    <Action xsi:type="ShowTaskpane">
                      <SourceLocation resid="Taskpane.Url"/>
                    </Action>
                  </Control>
                </Group>
              </OfficeTab>
            </ExtensionPoint>
            <ExtensionPoint xsi:type="AppointmentOrganizerCommandSurface">
              <OfficeTab id="TabDefault">
                <Group id="folioApptComposeGroup">
                  <Label resid="GroupLabel"/>
                  <Control xsi:type="Button" id="appOrgOpenPaneButton">
                    <Label resid="TaskPaneButton.Label"/>
                    <Supertip>
                      <Title resid="TaskPaneButton.Label"/>
                      <Description resid="TaskPaneButton.Tooltip"/>
                    </Supertip>
                    <Icon>
                      <bt:Image size="16" resid="Icon.16x16"/>
                      <bt:Image size="32" resid="Icon.32x32"/>
                      <bt:Image size="80" resid="Icon.80x80"/>
                    </Icon>
                    <Action xsi:type="ShowTaskpane">
                      <SourceLocation resid="Taskpane.Url"/>
                    </Action>
                  </Control>
                </Group>
              </OfficeTab>
            </ExtensionPoint>
            <ExtensionPoint xsi:type="LaunchEvent">
              <LaunchEvents>
                <LaunchEvent Type="OnMessageAttachmentsChanged" FunctionName="onMessageAttachmentsChangedHandler"/>
                <LaunchEvent Type="OnAppointmentAttachmentsChanged" FunctionName="onMessageAttachmentsChangedHandler"/>
                <LaunchEvent Type="OnMessageSend" FunctionName="onMessageSendHandler" SendMode="PromptUser"/>
                <LaunchEvent Type="OnAppointmentSend" FunctionName="onMessageSendHandler" SendMode="PromptUser"/>
              </LaunchEvents>
              <SourceLocation resid="WebViewRuntime.Url"/>
            </ExtensionPoint>
          </DesktopFormFactor>
        </Host>
      </Hosts>
      <Resources>
        <bt:Images>
          <bt:Image id="Icon.16x16" DefaultValue="${root}/outlook/icon-16.png"/>
          <bt:Image id="Icon.32x32" DefaultValue="${root}/outlook/icon-32.png"/>
          <bt:Image id="Icon.80x80" DefaultValue="${root}/outlook/icon-80.png"/>
        </bt:Images>
        <bt:Urls>
          <bt:Url id="Taskpane.Url" DefaultValue="${root}/outlook/pane"/>
          <bt:Url id="WebViewRuntime.Url" DefaultValue="${root}/outlook/commands.html"/>
          <bt:Url id="JSRuntime.Url" DefaultValue="${root}/outlook/commands.js"/>
        </bt:Urls>
        <bt:ShortStrings>
          <bt:String id="GroupLabel" DefaultValue="Folio"/>
          <bt:String id="TaskPaneButton.Label" DefaultValue="Lock PDFs"/>
        </bt:ShortStrings>
        <bt:LongStrings>
          <bt:String id="TaskPaneButton.Tooltip" DefaultValue="Password-protect unlocked PDF attachments on this PC."/>
        </bt:LongStrings>
      </Resources>
    </VersionOverrides>
  </VersionOverrides>
</OfficeApp>
`;
}

export const OUTLOOK_ADDIN_ID = ADDIN_ID;
