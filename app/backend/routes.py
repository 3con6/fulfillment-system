from starlette.routing import Mount, Route
from .views import user_views, main_views, api
from .resources import static



routes = [
    Mount('/static', static, name='auth_static'),
    
    # User
    Route("/", endpoint=main_views.home_page, methods=["GET"], name="home_page"),
    Route("/test_authen", endpoint=user_views.test_authen_page, methods=["GET"]),
    Route("/manage", endpoint=user_views.redirect_main, methods=["GET"]),

    Route("/auth/login", endpoint=user_views.login_page, methods=["GET", "POST"], name='login'),
    Route("/auth/logout", endpoint=user_views.logout_page, methods=["GET", "POST"], name="logout"),
    Route("/auth/register", endpoint=user_views.register_page, methods=["GET", "POST"]),
    Route("/manage_users", endpoint=user_views.manage_users_page, methods=["GET"], name="manage_users"),
    Route("/add_user", endpoint=user_views.add_user_page, methods=["GET", "POST"]),
    Route("/edit_user", endpoint=user_views.edit_user_page, methods=["GET", "POST"], name="edit_user"),
    Route("/delete_user", endpoint=user_views.delete_user_page, methods=["GET"]),

    Route("/manage_groups", endpoint=user_views.manage_groups_page, methods=["GET", "POST"], name="manage_groups"),
    Route("/add_group", endpoint=user_views.add_group_page, methods=["GET", "POST"]),
    Route("/edit_group", endpoint=user_views.edit_group_page, methods=["GET", "POST"]),
    Route("/delete_group", endpoint=user_views.delete_group_page, methods=["GET", "POST"]),
    
    Route("/manage_routes", endpoint=user_views.manage_routes_page, methods=["GET", "POST"], name="manage_routes"),
    Route("/add_route", endpoint=user_views.add_route_page, methods=["GET", "POST"]),
    Route("/edit_route", endpoint=user_views.edit_route_page, methods=["GET", "POST"]),
    Route("/delete_route", endpoint=user_views.delete_route_page, methods=["GET", "POST"]),

    
    
    # Main data
    Route("/products", endpoint=main_views.list_products, methods=["GET", "POST"], name="list_products"),
    Route("/out_of_stock", endpoint=main_views.out_of_stock, methods=["GET", "POST"], name="out_of_stock"),
    Route("/add_product/", endpoint=main_views.add_product, methods=["GET", "POST"], name="add_product"),
    Route("/edit_product", endpoint=main_views.edit_product, methods=["GET", "POST"], name="edit_product"),
    Route("/ff_products", endpoint=main_views.ff_list_products, methods=["GET", "POST"], name="ff_list_products"),
    Route("/ff_edit_product", endpoint=main_views.ff_edit_product, methods=["GET", "POST"], name="ff_edit_product"),
    Route("/ff_add_product", endpoint=main_views.ff_add_product, methods=["GET", "POST"], name="ff_add_product"),
    Route("/edit_product", endpoint=main_views.edit_product, methods=["GET", "POST"], name="edit_product"),

    Route("/design_type", endpoint=main_views.design_type, methods=["GET", "POST"], name="design_type"),
    Route("/edit_design_type", endpoint=main_views.edit_design_type, methods=["GET", "POST"], name="edit_design_type"),
    Route("/add_design_type", endpoint=main_views.add_design_type, methods=["GET", "POST"], name="ff_add_product"),

    Route("/orders", endpoint=main_views.orders, methods=["GET", "POST"], name="orders"),
    Route("/edit_order", endpoint=main_views.edit_order, methods=["GET", "POST"], name="edit_order"),
    Route("/edit_address", endpoint=main_views.edit_address, methods=["GET", "POST"], name="edit_address"),
    Route("/teams", endpoint=main_views.teams, methods=["GET", "POST"], name="teams"),
    Route("/add_team", endpoint=main_views.add_team, methods=["GET", "POST"], name="add_team"),
    Route("/edit_team", endpoint=main_views.edit_team, methods=["GET", "POST"], name="edit_team"),
    Route("/import_orders", endpoint=main_views.import_orders, methods=["GET", "POST"], name="import_orders"),
    Route("/import_labels", endpoint=main_views.import_labels, methods=["GET", "POST"], name="import_labels"),
    Route("/bulk_edit_by_csv", endpoint=main_views.bulk_edit_by_csv, methods=["GET", "POST"], name="bulk_edit_by_csv"),
    Route("/download_csv", endpoint=main_views.download_csv, methods=["GET"], name="download_csv"),
    Route("/download_xlsx", endpoint=main_views.download_xlsx, methods=["GET"], name="download_xlsx"),
    Route("/download_tracking_csv", endpoint=main_views.download_tracking_csv, methods=["GET"], name="download_tracking_csv"),
    Route("/download_tracking_xlsx", endpoint=main_views.download_tracking_xlsx, methods=["GET"], name="download_tracking_xlsx"),
    Route("/ff_ngoai", endpoint=main_views.ff_ngoai, methods=["GET", "POST"], name="ff_ngoai"),
    Route("/wrong_sku", endpoint=main_views.wrong_sku, methods=["GET", "POST"], name="wrong_sku"),
    Route("/wrong_product_type", endpoint=main_views.wrong_product_type, methods=["GET", "POST"], name="wrong_product_type"),
    Route("/fulfillment_page", endpoint=main_views.fulfillment_page, methods=["GET", "POST"], name="fulfillment_page"),
    Route("/list_export_ornc", endpoint=main_views.list_export_ornc, methods=["GET", "POST"], name="list_export_ornc"),

    Route("/order_assigned", endpoint=main_views.order_assigned, methods=["GET", "POST"], name="order_assigned"),
    Route("/check_design", endpoint=main_views.check_design, methods=["GET", "POST"], name="check_design"),

    Route("/export_data", endpoint=main_views.export_data, methods=["GET"], name="export_data"),
    
    Route("/favicon.ico", endpoint=main_views.favicon, methods=["GET"], name="favicon"),

    Route("/wallet", endpoint=main_views.wallet, methods=["GET"], name="wallet"),
    Route("/check_topup", endpoint=main_views.check_topup, methods=["GET"]),

    Route("/shops", endpoint=main_views.shops, methods=["GET"], name="shops"),
    Route("/edit_shop", endpoint=main_views.edit_shop, methods=["GET", "POST"], name="edit_shop"),
    Route("/add_shop", endpoint=main_views.add_shop, methods=["GET", "POST"], name="add_shop"),

    # analytics
    Route("/nb_team_analytics", endpoint=main_views.nb_team_analytics, methods=["GET"], name="nb_team_analytics"),
    Route("/analytics_private_team", endpoint=main_views.analytics_private_team, methods=["GET"], name="analytics_private_team"),
    Route("/other_team_analytics", endpoint=main_views.other_team_analytics, methods=["GET"], name="other_team_analytics"),
    Route("/designer_analytics", endpoint=main_views.designer_analytics, methods=["GET"], name="designer_analytics"),
    Route("/design_checked_analytics", endpoint=main_views.design_checked_analytics, methods=["GET"], name="design_checked_analytics"),
    
    Route("/personalize", endpoint=main_views.personalize, methods=["GET", "POST"], name="personalize"),
    Route("/list_psd", endpoint=main_views.list_psd, methods=["GET", "POST"], name="list_psd"),
    Route("/process_pdf", endpoint=main_views.process_pdf, methods=["GET", "POST"], name="process_pdf"),
    Route("/customize_design", endpoint=main_views.customize_design, methods=["GET", "POST"], name="customize_design"),
    Route("/list_pdf", endpoint=main_views.list_pdf, methods=["GET", "POST"], name="list_pdf"),
    Route("/png2pdf", endpoint=main_views.png2pdf, methods=["GET", "POST"], name="png2pdf"),

    # scan barcode
    Route("/scan_orders", endpoint=main_views.scan_orders, methods=["GET"], name="scan_orders"),

    # # 
    # # Api
    # #
    Route("/api/filter_order", endpoint=api.filter_order, methods=["POST"]),
    Route("/api/change_product_quantity", endpoint=api.change_product_quantity, methods=["POST"]),
    Route("/api/change_order_status", endpoint=api.change_order_status, methods=["POST"]),
    Route("/api/scan_change_order_status", endpoint=api.scan_change_order_status, methods=["POST"]),
    Route("/api/change_order_factory", endpoint=api.change_order_factory, methods=["POST"]),
    Route("/api/change_product_field", endpoint=api.change_product_field, methods=["POST"]),
    Route("/api/delete_product", endpoint=api.delete_product, methods=["POST"]),
    Route("/api/delete_design_type", endpoint=api.delete_design_type, methods=["POST"]),
    Route("/api/delete_team", endpoint=api.delete_team, methods=["POST"]),
    Route("/api/products", endpoint=api.get_range_date_products, methods=["POST"]),
    Route("/api/orders", endpoint=api.get_range_date_orders, methods=["POST"]),
    Route("/api/table_column", endpoint=api.table_column, methods=["POST"]),
    Route("/api/merge_orders", endpoint=api.merge_orders, methods=["POST"]),
    Route("/api/split_orders", endpoint=api.split_orders, methods=["POST"]),
    Route("/api/forward_shipping", endpoint=api.forward_shipping, methods=["POST"]),
    Route("/api/archive_order", endpoint=api.archive_order, methods=["POST"]),
    Route("/api/topup", endpoint=api.topup, methods=["POST"]),
    Route("/api/upload_order_design", endpoint=api.upload_order_design, methods=["POST"]),
    Route("/api/upload_order_design_reuse", endpoint=api.upload_order_design_reuse, methods=["POST"]),
    Route("/api/upload_order_design_ff_ngoai", endpoint=api.upload_order_design_ff_ngoai, methods=["POST"]),
    Route("/api/upload_order_design_ff_ngoai_edited", endpoint=api.upload_order_design_ff_ngoai_edited, methods=["POST"]),
    Route("/api/upload_gen_img", endpoint=api.upload_gen_design_pdf, methods=["POST"]),
    Route("/api/upload_gen_imgs", endpoint=api.upload_gen_design_pdf1, methods=["POST"]),
    Route("/api/image_fulfill_edit", endpoint=api.image_fulfill_edit, methods=["POST"]),
    Route("/api/get_image_info", endpoint=api.get_image_info, methods=["POST"]),
    Route("/api/get_link_des", endpoint=api.get_link_des, methods=["POST"]),
    Route("/api/search_designer", endpoint=api.search_designer, methods=["POST"]),
    Route("/api/assign_designer", endpoint=api.assign_designer, methods=["POST"]),
    Route("/api/approve_designer", endpoint=api.approve_designer, methods=["POST"]),
    Route("/api/reject_designer", endpoint=api.reject_designer, methods=["POST"]),
    Route("/api/bulk_edit", endpoint=api.bulk_edit, methods=["POST"]),
    Route("/api/reject_invoice", endpoint=api.reject_invoice, methods=["POST"]),
    Route("/api/approve_invoice", endpoint=api.approve_invoice, methods=["POST"]),
    Route("/api/replace_items", endpoint=api.replace_items, methods=["POST"]),
    Route("/api/kiotviet", endpoint=api.kiotviet, methods=["POST"]),
    Route("/api/export_xuong", endpoint=api.export_xuong, methods=["POST"]),
    Route("/api/export_ornc", endpoint=api.export_ornc, methods=["POST"]),
    Route("/api/export_ship", endpoint=api.export_ship, methods=["POST"]),
    Route("/api/sync_tracking", endpoint=api.sync_tracking, methods=["POST"]),
    Route("/api/get_products_ff_ngoai", endpoint=api.get_ff_ngoai_product, methods=["POST"]),
    Route("/api/get_ff_ngoai_variants", endpoint=api.get_ff_ngoai_variants, methods=["POST"]),
    Route("/api/get_ff_ngoai_sizes", endpoint=api.get_ff_ngoai_sizes, methods=["POST"]),
    Route("/api/get_ff_ngoai_colors", endpoint=api.get_ff_ngoai_colors, methods=["POST"]),
    Route("/api/fulfill_pritify", endpoint=api.fulfill_pritify, methods=["POST"]),
    Route("/api/fulfill_merchize", endpoint=api.fulfill_merchize, methods=["POST"]),
    Route("/api/fulfill_gearment", endpoint=api.fulfill_gearment, methods=["POST"]),
    Route("/api/import_trackings", endpoint=api.import_trackings, methods=["POST"]),
    Route("/api/set_statistics", endpoint=api.set_statistics, methods=["POST"]),
    Route("/api/export_data", endpoint=api.export_data, methods=["POST"]),
    Route("/api/export_scan_data", endpoint=api.export_scan_data, methods=["POST"]),
    Route("/api/export_scan_kiot", endpoint=api.export_scan_kiot, methods=["POST"]),
    Route("/api/update_rate", endpoint=api.update_rate, methods=["POST"]),
    Route("/api/insert_income", endpoint=api.insert_income, methods=["POST"]),
    Route("/api/get_income_history", endpoint=api.get_income_history, methods=["GET"]),
    Route("/api/delete_shop", endpoint=api.delete_shop, methods=["POST"]),
    Route("/api/get_barcode_data", endpoint=api.get_barcode_data, methods=["POST"]),
    Route("/api/analytics", endpoint=api.analytics, methods=["POST"]),
    Route("/api/analytics_private_team", endpoint=api.analytics_private_team, methods=["POST"]),
    Route("/api/designer_analytics", endpoint=api.designer_analytics, methods=["POST"]),
    Route("/api/design_checked_analytics", endpoint=api.design_checked_analytics, methods=["POST"]),
    Route("/api/process_order", endpoint=api.process_order, methods=["POST"]),
    Route("/api/save_pdf", endpoint=api.save_pdf, methods=["POST"]),
    Route("/api/upload_clipart", endpoint=api.upload_clipart, methods=["POST"]),
    Route("/api/get_order_history", endpoint=api.get_order_history, methods=["POST"]),
    Route("/api/edit_order_note", endpoint=api.edit_order_note, methods=["POST"]),
    Route("/api/export_flast_ship", endpoint=api.export_flast_ship, methods=["POST"]),
]