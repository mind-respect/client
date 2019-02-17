/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Template from '@/Template'
const api = {};
var t = Template.withTemplateGroup(api);

//vertex html elements
t.add(
    'vertex',
    '<div class="vertex graph-element absolute" style="top:{adjustedPosition.y};left:{adjustedPosition.x};"></div>'
);
t.add(
    'relative_vertex',
    '<div class="vertex graph-element relative bubble"></div>'
);
t.add(
    'vertex_label_container',
    '<input type="text" class="label" value="{label}">'
);
t.add('vertex_menu', '<div class="menu"></div>');
t.add('vertex_move_button', '<div class="move"></div>');
t.add(
    'identification_existing_identity',
    '<h3 class="type-label identification" identification-uri="{identification_uri}">{type_label}' +
    '<button class="remove-button-in-list">x</button>' +
    '</h3>' +
    '<div class="group description">{description}</div>'
);

t.add(
    'link_to_far_vertex_menu',
    '<div class="link-to-far-vertex-menu"></div>'
);

t.add('suggestions_menu', '<div class="suggestion"></div>');
t.add('suggestions_list', '<ul></ul>');
t.add(
    'suggestion',
    '<li><span class="text">{label}</span></li>'
);
t.add(
    'suggestions_menu_title',
    "<h2 data-i18n='vertex.menu.suggestion.title'></h2>"
);
t.add(
    'suggestions_instructions',
    "<h3>( <span data-i18n='vertex.menu.suggestion.instruction.1'></span><br/><span data-i18n='vertex.menu.suggestion.instruction.2'></span> )</h3>"
);

t.add('image_container', '<div class="image_container"></div>');
t.add('image_container_image', "<img src='{src}'>");

t.add('hidden_property_container', '<div class="hidden-properties-container"></div>');

t.add('auto_complete_suggestion_list', '<ul class="auto-complete-suggestion"></ul>');
t.add('auto_complete_suggestion_list_element', '<li>{name}</li>');
export default api;
