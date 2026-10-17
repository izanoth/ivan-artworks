-- Create rules to prevent permanent deletion
CREATE RULE "no_delete_content" AS ON DELETE TO "Content" DO INSTEAD NOTHING;
CREATE RULE "no_delete_page" AS ON DELETE TO "Page" DO INSTEAD NOTHING;
CREATE RULE "no_delete_footer" AS ON DELETE TO "FooterItem" DO INSTEAD NOTHING;
