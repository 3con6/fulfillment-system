# DB
    ## Collections
        - users
        - groups
        - routes
    ## Users
        ```
        {
            'username': username, 
            'password': hashed_password,
            'group': [groups]
        }
        ```
    ## Groups
        ```
        {
            'group': group_name,
            'routes': [routes]
        }
        ```
    ## Routes
        ```
        {
            'route': route
        }
        ```
# User
Vào page register để đăng ký tài khoản mới rồi vào db add thêm group là dev để có toàn quyền
# Special group
Khi tạo mới db phải tạo sẵn 3 group dưới
- Dev: all permission
- Admin: allow: Add, Edit, Delete user | Grant group to user
- Mod: allow Add, Edit user | Grant group to user
(Add, Edit, Delete user là các routes được thêm vào các group tương ứng như trên, group dev mặc định trong code là không được xoá)

# Routes Permission
Add to group by dev
# All auth routes
```
/auth/delete_route
/auth/edit_route
/auth/add_route
/auth/manage_routes
/auth/delete_group
/auth/edit_group
/auth/add_group
/auth/manage_groups
/auth/delete_user
/auth/edit_user
/auth/add_user
/auth/manage_users
/auth/register
/auth/logout
/auth/login
/auth/manage
/auth/test_authen
```