package AppDev.CampusMarketplace.Controller;

import AppDev.CampusMarketplace.Entity.SellerApplication;
import AppDev.CampusMarketplace.Model.SellerApplicationRequest;
import AppDev.CampusMarketplace.Model.SellerApplicationResponse;
import AppDev.CampusMarketplace.Service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @PostMapping("/seller-applications")
    public ResponseEntity<?> applyForSeller(@RequestBody SellerApplicationRequest request) {
        try {
            SellerApplication application = userManagementService.applyForSeller(
                    request.getShopName(),
                    request.getReason(),
                    request.getStudentIdImage()
            );
            return ResponseEntity.ok(SellerApplicationResponse.fromEntity(application));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/seller/apply")
    public ResponseEntity<?> applyForSellerAlias(@RequestBody SellerApplicationRequest request) {
        return applyForSeller(request);
    }

    @GetMapping("/seller-applications/pending")
    public ResponseEntity<?> getPendingApplications() {
        try {
            List<SellerApplicationResponse> response = userManagementService.getPendingApplications()
                    .stream()
                    .map(SellerApplicationResponse::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/seller-applications/{applicationId}/approve")
    public ResponseEntity<?> approveSeller(@PathVariable Long applicationId) {
        try {
            SellerApplication application = userManagementService.approveSeller(applicationId);
            return ResponseEntity.ok(SellerApplicationResponse.fromEntity(application));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/promote/{userId}")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long userId) {
        try {
            var user = userManagementService.promoteToAdmin(userId);
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "username", user.getUsername(),
                    "role", user.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
