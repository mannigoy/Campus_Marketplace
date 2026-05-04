package AppDev.CampusMarketplace.Service;

import AppDev.CampusMarketplace.Entity.Role;
import AppDev.CampusMarketplace.Entity.SellerApplication;
import AppDev.CampusMarketplace.Entity.SellerApplicationStatus;
import AppDev.CampusMarketplace.Entity.SellerStore;
import AppDev.CampusMarketplace.Entity.User;
import AppDev.CampusMarketplace.Repository.SellerApplicationRepository;
import AppDev.CampusMarketplace.Repository.SellerStoreRepository;
import AppDev.CampusMarketplace.Repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final SellerApplicationRepository sellerApplicationRepository;
    private final SellerStoreRepository sellerStoreRepository;

    public UserManagementService(UserRepository userRepository,
                                 SellerApplicationRepository sellerApplicationRepository,
                                 SellerStoreRepository sellerStoreRepository) {
        this.userRepository = userRepository;
        this.sellerApplicationRepository = sellerApplicationRepository;
        this.sellerStoreRepository = sellerStoreRepository;
    }

    public User promoteToAdmin(Long targetUserId) {
        User currentUser = getCurrentUser();
        requireRole(currentUser, Role.SUPERADMIN);

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found."));

        if (targetUser.getRole() == Role.SUPERADMIN) {
            throw new RuntimeException("Cannot change superadmin role.");
        }

        if (getSafeRole(targetUser) != Role.CUSTOMER) {
            throw new RuntimeException("Only customers can be promoted to admin.");
        }

        targetUser.setRole(Role.ADMIN);
        return userRepository.save(targetUser);
    }

    public SellerApplication applyForSeller(String shopName, String reason, String studentIdImage) {
        User currentUser = getCurrentUser();
        requireRole(currentUser, Role.CUSTOMER);

        if (shopName == null || shopName.isBlank()) {
            throw new RuntimeException("Shop name is required.");
        }

        if (sellerApplicationRepository.existsByUserIdAndStatus(currentUser.getId(), SellerApplicationStatus.PENDING)) {
            throw new RuntimeException("You already have a pending application.");
        }

        SellerApplication application = new SellerApplication();
        application.setUser(currentUser);
        application.setShopName(shopName);
        application.setReason(reason);
        application.setStudentIdImage(studentIdImage);
        application.setStatus(SellerApplicationStatus.PENDING);

        return sellerApplicationRepository.save(application);
    }

    @Transactional
    public SellerApplication approveSeller(Long applicationId) {
        User currentUser = getCurrentUser();
        requireAnyRole(currentUser, Role.ADMIN, Role.SUPERADMIN);

        SellerApplication application = sellerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found."));

        if (application.getStatus() != SellerApplicationStatus.PENDING) {
            throw new RuntimeException("Application already processed.");
        }

        User applicant = application.getUser();
        if (getSafeRole(applicant) != Role.CUSTOMER) {
            throw new RuntimeException("User is not eligible for seller approval.");
        }

        if (sellerStoreRepository.findByUserId(applicant.getId()).isEmpty()) {
            SellerStore store = new SellerStore();
            store.setStoreName(application.getShopName());
            store.setDescription(application.getReason());
            store.setUser(applicant);
            sellerStoreRepository.save(store);
            applicant.setSellerStore(store);
        }

        applicant.setRole(Role.SELLER);
        applicant.setApprovedSeller(true);
        userRepository.save(applicant);

        application.setStatus(SellerApplicationStatus.APPROVED);
        return sellerApplicationRepository.save(application);
    }

    public List<SellerApplication> getPendingApplications() {
        User currentUser = getCurrentUser();
        requireAnyRole(currentUser, Role.ADMIN, Role.SUPERADMIN);
        return sellerApplicationRepository.findByStatus(SellerApplicationStatus.PENDING);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized.");
        }

        String email = authentication.getPrincipal().toString();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    private void requireRole(User user, Role role) {
        if (getSafeRole(user) != role) {
            throw new RuntimeException("Forbidden.");
        }
    }

    private void requireAnyRole(User user, Role... roles) {
        Role currentRole = getSafeRole(user);
        for (Role role : roles) {
            if (currentRole == role) {
                return;
            }
        }
        throw new RuntimeException("Forbidden.");
    }

    private Role getSafeRole(User user) {
        if (user.getRole() == null) {
            user.setRole(Role.CUSTOMER);
            userRepository.save(user);
        }
        return user.getRole();
    }
}
