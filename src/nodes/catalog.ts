// The node catalog. Every node type used in a flow is registered here.
// Each entry declares the display label, icon, category, and default runtime config.

export type NodeKind =
  | 'trigger.webhook'
  | 'trigger.incoming_message'
  | 'wa.send_text'
  | 'wa.send_image'
  | 'wa.send_cta_url'
  | 'http.request'
  | 'logic.branch'
  | 'logic.delay'
  | 'integration.slack'
  | 'integration.discord'
  | 'integration.google_sheets'
  | 'integration.openai'

export type NodeCategory = 'trigger' | 'whatsapp' | 'logic' | 'integration'

export interface NodeMeta {
  label: string
  icon: string
  category: NodeCategory
  description: string
  defaults: Record<string, unknown>
}

export const NODE_CATALOG: Record<NodeKind, NodeMeta> = {
  'trigger.webhook': {
    label: 'Webhook trigger',
    icon: 'bi-broadcast-pin',
    category: 'trigger',
    description: 'Fires when Waxum receives an event from WhatsApp.',
    defaults: { event: 'message' },
  },
  'trigger.incoming_message': {
    label: 'Incoming message',
    icon: 'bi-chat-dots',
    category: 'trigger',
    description: 'Fires on every incoming WA message on this session.',
    defaults: { session_id: '', match: '' },
  },
  'wa.send_text': {
    label: 'Send text',
    icon: 'bi-chat-text',
    category: 'whatsapp',
    description: 'Send a plain text message.',
    defaults: { to: '', text: '' },
  },
  'wa.send_image': {
    label: 'Send image',
    icon: 'bi-images',
    category: 'whatsapp',
    description: 'Send an image with an optional caption.',
    defaults: { to: '', image_url: '', caption: '' },
  },
  'wa.send_cta_url': {
    label: 'Send CTA URL',
    icon: 'bi-link45deg',
    category: 'whatsapp',
    description: 'Interactive button that opens a URL on tap.',
    defaults: { to: '', body_text: '', display_text: '', url: '' },
  },
  'http.request': {
    label: 'HTTP request',
    icon: 'bi-globe',
    category: 'logic',
    description: 'Call an external API.',
    defaults: { method: 'GET', url: '', headers: {}, body: '' },
  },
  'logic.branch': {
    label: 'Branch',
    icon: 'bi-diagram3',
    category: 'logic',
    description: 'If / else on an incoming value.',
    defaults: { condition: '' },
  },
  'logic.delay': {
    label: 'Delay',
    icon: 'bi-clock',
    category: 'logic',
    description: 'Wait N seconds before continuing.',
    defaults: { seconds: 5 },
  },
  'integration.slack': {
    label: 'Slack post',
    icon: 'bi-slack',
    category: 'integration',
    description: 'Post a message to a Slack channel via webhook.',
    defaults: { webhook_url: '', text: '' },
  },
  'integration.discord': {
    label: 'Discord post',
    icon: 'bi-discord',
    category: 'integration',
    description: 'Post a message to Discord via webhook.',
    defaults: { webhook_url: '', content: '' },
  },
  'integration.google_sheets': {
    label: 'Google Sheets append',
    icon: 'bi-cloud-arrow-up-fill',
    category: 'integration',
    description: 'Append a row to a Google Sheet.',
    defaults: { sheet_id: '', range: 'A:Z', values: [] },
  },
  'integration.openai': {
    label: 'OpenAI chat',
    icon: 'bi-robot',
    category: 'integration',
    description: 'Send a prompt to an OpenAI-compatible endpoint.',
    defaults: { base_url: 'https://api.openai.com/v1', model: 'gpt-4o-mini', prompt: '' },
  },
}
